//@ts-check
const
{ Socket } = require("socket.io"),
{ config, games, errors, VotkiError, VotkiPermsError } = require('./misc'),
Game = require('./game'),
fs = require('fs')

module.exports = class User{
    /**
     * @param {Socket} client Socket client 
     * @param {string} name Name of the user
     * @param {Game | null} game For ts purposes only do not fill up
     */
    constructor(client, name = config.default_name, game = null) {
        this.client = client
        this.name = name
        this.avatar = "user.png"
        this.game = game
        this.grade = 0
        this.ready = false
        
        this.client.onAny((event, ...arg) => {
            if(typeof this[event] == "function"){
                try {
                    let res = this[event](...arg)
                    
                    if(res instanceof Promise)
                    res.then(data => this.client.emit(event, data))
                    else
                    this.client.emit(event, res)
                } catch (error) {
                    if(error instanceof VotkiError){
                        this.client.emit("error", error.message)
                    }else{
                        throw error
                    }
                }
            }
        })
    }

    /**
     * @param {string} gameId Id of the game to join
     */
    join(gameId){
        console.log(this.name + " is trying to join game with id " + gameId)

        let game = games.find(game => game.id == gameId)

        if(!game) {
            this.client.emit("error", errors.cantFindGame.message)
            return false
        }
    
        game.join(this)
        this.game = game

        return true
    }

    /**
     * @returns {string | null} The assigned new name
     * @param {string | null} newName The new name to assign
     */
    rename(newName = config.default_name){
        newName = newName ?? config.default_name
        if(newName && newName != this.name){
            console.log(this.name + " renamed himself " + newName)
            this.name = newName
        }
        return this.name
    }

    /**
     * @returns {Object} Game status
     */
    getGameStatus(){
        if(!this.game) throw errors.playerNotInAGame
        return this.game.getStatus()
    }

    /**
     * @param {string} username The username to create the game with
     * @returns {Object | null} Object containing game status, id, settings and new username
     */
    createGame(username){
        if(!this.game){
            let newName = this.rename(username)
            let game = new Game()
            game.join(this)
            console.log(this.name + " created a new game with id " + game.id)
            this.grade = 2
            return {id: game.id, status: game.getStatus(), username: newName, settings: game.getSettings()}
        }else
        return null
    }

    /**
     * @returns {void}
     */
    leave(){
        if(!this.game){
            throw errors.playerNotInAGame
        }
        
        this.game.users.splice(this.game.users.findIndex(u => u == this), 1)
        this.client.leave(this.game.id)
        
        let arePlayersLeft = this.game.users.length > 0
        if(arePlayersLeft){
            if(this.grade){
                if(this.game.users[0].grade <= this.grade){
                    this.game.users[0].grade = this.grade
                }
            }

            this.game.broadcast("playersChanged", this.game.getUsers())
        }else{
            console.log("Game " + this.game.id + " disconnected")
            games.splice(games.findIndex(game => game == this.game), 1)
        }
    }

    /**
     * @param {string} mode The game mode id to set to
     */
    setGameMode(mode = "normal"){
        if(!this.game) throw errors.playerNotInAGame
        if(this.game.phase != "lobby") throw errors.gameAlreadyStarted
        if(!this.hasModPerms()) throw new VotkiPermsError(2)

        this.game.settings.mode = mode
        this.game.broadcast("settingsChanged", this.game.getSettings())

        console.log(this.name + " set mode to " + mode)
    }

    /**
     * @param {string} setting The setting to set to
     * @param {any} arg The value to set
     */
    setGameSetting(setting, arg){
        if(!this.game) throw errors.playerNotInAGame
        if(this.game.phase != "lobby") throw errors.gameAlreadyStarted
        if(!this.hasModPerms()) throw new VotkiPermsError(2)

        this.game.settings[setting] = arg
        this.game.broadcast("settingsChanged", this.game.getSettings())
    }

    getGameSettings(){
        if(!this.game) throw errors.playerNotInAGame
        return this.game.getSettings()
    }

    /**
     * @returns {boolean} if user has mod perms or not
     */
    hasModPerms(){
        return this.grade >= 2
    }

    getGameModes(){
        return config.modes
    }

    startGame(){
        if(!this.game) throw errors.playerNotInAGame
        if(this.game.phase != "lobby") throw errors.gameAlreadyStarted
        if(!this.hasModPerms()) throw new VotkiPermsError(2)

        this.game.start()
    }

    getRandomAvatar(){
        let avatars = fs.readdirSync(config.avatars_dir)
        let index = Math.floor(Math.random() * avatars.length)
        this.avatar = avatars[index]
        if(this.game){
            this.game.broadcast("playersChanged", this.game.getUsers())
        }
        return this.avatar
    }
}

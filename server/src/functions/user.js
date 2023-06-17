//@ts-check
const
{ Socket } = require("socket.io"),
{ config, games, errors, VotkiError, VotkiPermsError } = require('./misc'),
Game = require('./game'),
fs = require('fs')

module.exports = class User{
    /**
     * @param {Socket} client 
     * @param {string} name 
     */
    constructor(client, name = config.default_name) {
        this.client = client
        this.name = name
        this.avatar = "user.png"
        this.game = null
        this.grade = 0
        
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
     * @returns {boolean}
     * @param {string} gameId 
     */
    join(gameId){
        console.log(this.name + " is trying to join game with id " + gameId)

        let game = games.find(game => game.id == gameId)

        if(game){
            this.game = game
            game.join(this)
            return true
        }else
        return false
    }

    /**
     * @returns {string | null}
     * @param {string | null} newName 
     */
    rename(newName = config.default_name){
        newName = newName ?? config.default_name
        if(newName && newName != this.name){
            console.log(this.name + " renamed himself " + newName)
            this.name = newName
        }
        return newName
    }

    /**
     * @returns {any | null}
     */
    getGameStatus(){
        try {
            return this.game.getStatus()
        } catch (error) {
            this.game = null
            return null
        }
    }

    /**
     * @param {string} username
     * @returns {Object | null}
     */
    createGame(username){
        if(!this.game){
            this.rename(username)
            let game = new Game()
            game.join(this)
            console.log(this.name + " created a new game with id " + game.id)
            this.grade = 2
            return {id: game.id, status: game.getStatus(), username}
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

    setGameMode(mode = "normal"){
        if(!this.hasModPerms()){
            throw new VotkiPermsError(2)
        }

        this.game.settings.mode = mode
        this.game.broadcast("settingsChanged", this.game.getSettings())

        console.log(this.name + " set mode to " + mode)
    }

    /**
     * @param {string} setting 
     * @param {any} arg 
     */
    setGameSetting(setting, arg){
        if(!this.hasModPerms()){
            throw new VotkiPermsError(2)
        }

        this.game.settings[setting] = arg
        this.game.broadcast("settingsChanged", this.game.getSettings())
    }

    getGameSettings(){
        return this.game.getSettings()
    }

    /**
     * @returns {boolean}
     */
    hasModPerms(){
        if(!this.game){
            throw errors.playerNotInAGame
        }
        return this.grade >= 2
    }

    getGameModes(){
        return config.modes
    }

    startGame(){
        if(!this.hasModPerms())
        throw new VotkiPermsError(2)

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

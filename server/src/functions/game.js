//@ts-check
const { games, errors, io, config } = require("./misc");
const GamePhase = require("./phases");
const User = require("./user")

const chars =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function convertNumberToBase64(number) {
  let encoded = "";

  while (number > 0) {
    encoded = chars.charAt(number % chars.length) + encoded;
    number = Math.floor(number / chars.length);
  }

  return encoded;
}

function millisecondsFromStartOfYear() {
    const now = new Date(); // Current date and time
    const startOfYear = new Date(now.getFullYear(), 0, 1); // First day of the year
    const milliseconds = now.getTime() - startOfYear.getTime(); // Difference in milliseconds
    return milliseconds;
}

module.exports = class Game{
    /**
     * @param {User[]} users For ts purposes do not fill in any params
     */
    constructor(users = []){
        this.phase = "lobby"
        this.phaseIndex = -1
        this.phaseObj = new GamePhase.phases[this.phase](this)
        this.users = users
        this.id = convertNumberToBase64(millisecondsFromStartOfYear())
        games.push(this)
        this.settings = {}
        this.setMode("normal")
    }

    getStatus(){
        return {
            users: this.getUsers(),
            phase: this.phase,
        }
    }

    getUsers(){
        const users = []
        for(let user of this.users){
            users.push({
                name: user.name, 
                avatar: user.avatar,
                grade: user.grade,
            })
        }
        return users
    }

    /**
     * @param {User} user User who's joining
     */
    join(user){
        if(this.users.includes(user))
        throw errors.userAlreadyJoined

        this.users.push(user)
        user.client.join(this.id)
        user.game = this

        this.broadcast("playersChanged", this.getUsers())

        console.log(user.name + " joined game with id " + this.id)
    }

    /**
     * @param {string} channel channel event name to broadcast all users to
     * @param {any[]} arg the args to broadcast
     */
    broadcast(channel, ...arg){
        io.to(this.id).emit(channel, ...arg)
    }

    start(){
        if(this.phase != "lobby")
        throw errors.gameAlreadyStarted

        this.nextPhase()
    }

    /**
     * @param {string | undefined} gamemode id du mode de jeu
     */
    setMode(gamemode = "normal"){
        if(!config.modes[gamemode]){
            throw errors.modeDoesNotExists
        }

        let modeConfig = config.modes[gamemode]
        for(let setting of modeConfig.settings){
            if(!this.settings[setting]){
                this.settings[setting] = config.settings[setting].default
            }
        }

        this.settings.mode = gamemode
    }
    
    /**
     * @param {any[] | null} lastPhaseData 
     */
    nextPhase(lastPhaseData = null){
        this.phaseIndex++
        if(config.modes[this.settings.mode].phases[this.phaseIndex]){
            this.phase = config.modes[this.settings.mode].phases[this.phaseIndex]
        }else{
            this.end()
        }

        switch (this.phase) {
            case "vote-questions":
                this.phaseObj = new GamePhase.phases["vote-questions"](this, lastPhaseData)
                break;
            default:
                this.phaseObj = new GamePhase.phases[this.phase](this)
                break;
        }

        this.broadcast("gameUpdate", this.getStatus())
    }

    getSettings(){
        let output = {}
        for(let setting of config.modes[this.settings.mode].settings){
            let value = this.settings[setting]
            let data = config.settings[setting]
            output[setting] = {
                value,
                type: data.type,
                name: data.name,
                default: data.default,
            }
        }
        output.mode = this.settings.mode
        return output
    }

    end(){
        this.phase = "summary"
    }

    /**
     * @param {string} inEvent 
     * @param {string} outEvent 
     * @returns {Promise<{user: User, value:any[]}[]>}
     */
    retrieve = (inEvent, outEvent) => new Promise((resolve) => {
        const promises = []
        for(let user of this.users){
            promises.push(new Promise((resolve, reject) => {
                user.client.emit(inEvent)
                user.client.on(outEvent, (...args) => {
                    resolve({user, value: args})
                })

                setTimeout(() => {
                    resolve({user, value: null})
                }, 5000)
            }))
        }

        Promise.all(promises).then(data => {
            resolve(data)
        })
    })
}
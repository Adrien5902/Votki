//@ts-check
const { games, errors, io, config } = require("./misc")
const User = require("./user")
const { Server } = require("socket.io")

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
    constructor(){
        this.phase = "lobby"
        this.users = []
        this.id = convertNumberToBase64(millisecondsFromStartOfYear())
        this.timer = Date.now()
        games.push(this)
        this.settings = {}
        this.setMode("normal")
    }

    getStatus(){
        return {
            users: this.getUsers(),
            phase: this.phase,
            timer: this.timer,
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
     * @param {User} user 
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
     * @param {string} channel 
     * @param {any[]} arg 
     */
    broadcast(channel, ...arg){
        io.to(this.id).emit(channel, ...arg)
    }

    start(){
        if(this.phase != "lobby")
        throw errors.gameAlreadyStarted

        this.nextPhase()
    }

    setMode(gamemode){
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
    
    nextPhase(){

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
}
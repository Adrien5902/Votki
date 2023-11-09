import { io, server, games } from './functions/misc.ts';
import User from './functions/user.ts';
import readline from 'readline';

io.on('connection', client => {
    let user = new User(client)
    console.log(user.name + " logged in")
    client.on("disconnect", () => {
        console.log("User " + user.name + " disconnected")
        try {
            user.leave()
        } catch (error) {}
    })
});

server.listen(3002);

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

function findUser(username: string){
    for(let game of games){
        let user = game.users.find(user => user.name == username)

        if(user)
        return user
    }
    return null
}

const commands = {
    "setgrade": {
        execute: (username: string, grade = 2) => {
            let user = findUser(username)
            grade = Number(grade)
            if(user){
                user.grade = grade
                if(user.game) user.game.broadcast("playersChanged", user.game.getUsers())
            }
        }
    },

    "kick": {
        execute: (username: string) => {
            let user = findUser(username)
            if(user){
                user.leave()
                user.client.disconnect(true)
            }
        }
    }
}

rl.on('line', (line) => {
    for(let commandName of Object.keys(commands)){
        if(!line.startsWith(commandName)){
            continue
        }

        let command = commands[commandName]
        const args = line.split(" ")
        args.splice(0, 1)
        command.execute.apply(this, args)
    }
});
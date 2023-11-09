import https from 'https';
import fs from "fs";
import { Server } from "socket.io";
import Game from './game';
import config from "./../config.json"

const options = {
    key: fs.readFileSync('C:\\SSL certs\\privkey.pem'),
    cert: fs.readFileSync('C:\\SSL certs\\cert.pem')
};

export const server = https.createServer(options);

export const io = new Server(server, {  
    cors: {
        origin: "https://adrien5902.ddns.net",
        methods: ["GET", "POST"]
    }
});

export class VotkiError extends Error{
    constructor(message = "Une erreur est survenue"){
        message = message ?? "Une erreur est survenue"
        super(message)
    }

    static errors = {
        userAlreadyJoined: new VotkiError("L'utilisateur fait déjà partie de cette partie"),
        playerNotInAGame: new VotkiError("Le joueur n'est dans aucune partie"),
        gameAlreadyStarted: new VotkiError("La partie a déjà commencée"),
        modeDoesNotExists: new VotkiError("Ce mode de jeu n'existe pas"),
        cantFindGame: new VotkiError("Partie introuvable"),
    }
}

export class VotkiPermsError extends VotkiError{
    level: number
    constructor(level: number){
        super(`Vous avez besoin de permissions de niveau ${level} pour faire ceci`)
        this.level = level
    }
}

export const games :Game[] = []

server.on("listening", ()=>{
    console.log("Game ready!")
})

export function randomQuestion(){
    return config["random_questions"][Math.floor(Math.random() * config["random_questions"].length)]
}

export const errors = VotkiError.errors;

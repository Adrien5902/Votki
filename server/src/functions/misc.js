//@ts-check
const https = require('https')
const fs = require("fs")
const { Server } = require("socket.io")
const options = {
    key: fs.readFileSync('C:\\SSL certs\\privkey.pem'),
    cert: fs.readFileSync('C:\\SSL certs\\cert.pem')
};

const server = https.createServer(options);

const io = new Server(server, {  
    cors: {
        origin: "https://adrien5902.ddns.net",
        methods: ["GET", "POST"]
    }
});

class VotkiError extends Error{
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

class VotkiPermsError extends VotkiError{
    /**
     * @param {Number} level 
     */
    constructor(level){
        super(`Vous avez besoin de permissions de niveau ${level} pour faire ceci`)
        this.level = level
    }
}

const config = JSON.parse(fs.readFileSync("src/config.json").toString())

const games = []

server.on("listening", ()=>{
    console.log("Game ready!")
})

/**
 * @returns {string}
 */
function randomQuestion(){
    return config["random_questions"][Math.floor(Math.random() * config["random_questions"].length)]
}

module.exports = {
    config,
    games,
    io,
    server,
    randomQuestion,

    errors: VotkiError.errors,
    VotkiError,
    VotkiPermsError,
}
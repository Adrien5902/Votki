const Game = require("./game")
const Question = require("./question")

class GamePhase{
    /**
     * @param {Game} game 
     * @param {Number} roundDuration 
     * @param {string | Number} maxRound 
     */
    constructor(game, roundDuration, maxRound, skippable = true){
        if(maxRound == "players"){
            this.maxRound = game.users.length
        }else{
            this.maxRound = maxRound
        }

        this.roundDuration = roundDuration * 1000 //Convertir s en ms
        this.game = game
        this.round = 0
        this.start()

        if(skippable){
            this.listen("ready", (user, ready = true) => {
                user.ready = ready
                
                let usersReady = 0
                for(let user of this.game.users){
                    if(user.ready) usersReady++
                }

                if(usersReady >= this.game.users.length){
                    this.end()
                }
            })
        }
    }

    async start(){
        if(typeof this.onStart == "function") await this.onStart()
        this.game.timer = Date.now() + this.roundDuration
        this.game.phase = Object.keys(GamePhase.phases).find(key => GamePhase.phases[key] == this.constructor)
        this.round = 0
        this.nextRound()
    }

    nextRound(){
        if(this.round >= this.maxRound && this.round != 0){
            this.end()
        }else{
            if(typeof this.onNewRound == "function") this.onNewRound()

            this.round++
            setTimeout(() => {
                this.game.timer = Date.now() + this.roundDuration
            }, this.roundDuration)
        }
    }

    async end(){
        let lastPhaseData = null
        if(typeof this.onEnd == "function") lastPhaseData = await this.onEnd()
        this.game.nextPhase(lastPhaseData)
    }

    /**
     * @param {string} event The event to listen to
     * @param {Function} cb Callback with user and arguments emitted by the user
     */
    listen(event, cb){
        if(this.game.users){
            for(let user of this.game.users){
                user.client.on(event, (...arg)=>{
                    cb(user, ...arg)
                })
            }
        }
    }
}

class VoteQuestionsGamePhase extends GamePhase{
    /**
     * @param {Question[] | null} questions 
     * @param {Game} game 
     * @param {Number} roundDuration 
     */
    constructor(game, questions, roundDuration = 25) {
        super(game, roundDuration, questions.length, true)
        questions.sort((a, b) => 0.5 - Math.random())
        this.questions = questions
    }
}

class AskQuestionsGamePhase extends GamePhase{
    constructor(game, roundDuration = 25) {
        super(game, roundDuration, 0, true)
    }

    onEnd = () => new Promise(async (resolve) => {
        let questions = await this.game.retrieve("retrieveQuestionInput", "questionInput")
        questions.map(({user, value}) => {
            let input = Array.isArray(value) ? value[0] : value
            return new Question(user, input)
        })
        resolve(questions)
    })
}

class LobbyGamePhase extends GamePhase{
    /**
     * @param {Game} game 
     */
    constructor(game){
        super(game, 0, 0, true)
    }
}

GamePhase.phases = {
    "ask-questions": AskQuestionsGamePhase,
    "vote-questions": VoteQuestionsGamePhase,
    "lobby": LobbyGamePhase,
}

module.exports = GamePhase
import Game from "./game.ts"
import Question from "./question.ts"

export default class GamePhase {
    maxRound: number
    roundDuration: number
    game: Game
    round: number
    name: string

    onStart?: () => Promise<unknown>
    onEnd?: () => Promise<unknown>
    onNewRound?: () => Promise<unknown>

    constructor(game: Game, roundDuration: number, maxRound: number | "players", skippable = true, name: string = "lobby") {
        if (maxRound == "players") {
            this.maxRound = game.users.length
        } else {
            this.maxRound = maxRound
        }

        this.roundDuration = roundDuration * 1000 //Convertir s en ms
        this.game = game
        this.round = 0
        this.name = name
        this.start()

        if (skippable) {
            this.listen("ready", (user, ready = true) => {
                user.ready = ready

                let usersReady = 0
                for (let user of this.game.users) {
                    if (user.ready) usersReady++
                }

                if (usersReady >= this.game.users.length) {
                    this.end()
                }
            })
        }
    }

    async start() {
        if (this.onStart) await this.onStart()
        // this.timer = Date.now() + this.roundDuration
        // this.game.phase = Object.keys(GamePhase.phases).find(key => GamePhase.phases[key] == this.constructor)
        this.round = 0
        this.nextRound()
    }

    nextRound() {
        if (this.round >= this.maxRound && this.round != 0) {
            this.end()
        } else {
            if (typeof this.onNewRound == "function") this.onNewRound()

            this.round++
            setTimeout(() => {
                // this.game.timer = Date.now() + this.roundDuration
            }, this.roundDuration)
        }
    }

    async end() {
        let lastPhaseData: any = null
        if (this.onEnd) lastPhaseData = await this.onEnd()
        this.game.nextPhase(lastPhaseData)
    }

    /**
     * @param {string} event The event to listen to
     * @param {Function} cb Callback with user and arguments emitted by the user
     */
    listen(event: string, cb: Function) {
        if (this.game.users) {
            for (let user of this.game.users) {
                user.client.on(event, (...arg) => {
                    cb(user, ...arg)
                })
            }
        }
    }
}

export class VoteQuestionsGamePhase extends GamePhase {
    questions: Question[]
    constructor(game: Game, questions: Question[], roundDuration = 25) {
        super(game, roundDuration, questions.length, true)
        questions.sort(() => Math.random() - .5)
        this.questions = questions
        this.name = "vote-questions"
    }
}

export class AskQuestionsGamePhase extends GamePhase {
    constructor(game: Game, roundDuration = 25) {
        super(game, roundDuration, 0, true)
    }

    onEnd = () => new Promise(async (resolve) => {
        let questions = await this.game.retrieve("retrieveQuestionInput", "questionInput")
        questions.map(({ user, value }) => {
            let input = Array.isArray(value) ? value[0] : value
            return new Question(user, input)
        })
        resolve(questions)
    })
}

export class LobbyGamePhase extends GamePhase {
    constructor(game: Game) {
        super(game, 0, 0, true)
    }
}

export class SummaryGamePhase extends GamePhase {
    constructor(game: Game) {
        super(game, 0, 0, false)
    }
}
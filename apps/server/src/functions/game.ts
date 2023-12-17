import { games, VotkiError, io } from "./misc.ts";
import GamePhase, { LobbyGamePhase, SummaryGamePhase } from "./phases.ts";
import User from "./user.ts";
import config from './../config.json' assert { type: "json" };
import { GameMode, GameResolvable, GameSettings } from './../../../shared/game.ts';
import { UserResolvable } from "../../../shared/user.ts";

const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function convertNumberToBase64(number: number) {
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

export default class Game implements GameResolvable {
    phaseIndex: number
    phase: GamePhase
    users: User[]
    id: string
    settings: GameSettings

    constructor(users = []) {
        this.phaseIndex = -1
        this.users = users
        this.id = convertNumberToBase64(millisecondsFromStartOfYear())
        games.push(this)
        this.phase = new LobbyGamePhase(this)
        this.setMode("normal")
    }

    getStatus(triggeringUser?: User) {
        return {
            users: this.getUsers(triggeringUser),
            phase: this.phase,
        }
    }


    getUsers(triggeringUser?: User) {
        const users: UserResolvable[] = []
        for (let user of this.users) {
            users.push({
                name: user.name,
                avatar: user.avatar,
                grade: user.grade,
                you: user == triggeringUser
            })
        }
        return users
    }

    join(user: User) {
        if (this.users.includes(user))
            throw VotkiError.errors.userAlreadyJoined

        this.users.push(user)
        user.client.join(this.id)
        user.game = this

        this.mappedBroadcast("playersChanged", (user) => this.getUsers(user))

        console.log(user.name + " joined game with id " + this.id)
    }

    broadcast(channel: string, ...arg: any[]) {
        io.to(this.id).emit(channel, ...arg)
    }

    /**
     * @param {string} channel 
     * @param {function} mapping 
     */
    mappedBroadcast(channel: string, mapping: (user: User) => any) {
        for (let user of this.users) {
            user.client.emit(channel, mapping(user))
        }
    }

    start() {
        if (this.phase.name)
            throw VotkiError.errors.gameAlreadyStarted

        this.nextPhase()
    }

    /**
     * @param {string | undefined} gamemode id du mode de jeu
     */
    setMode(gamemode: GameMode = "normal") {
        if (!config.modes[gamemode]) {
            throw VotkiError.errors.modeDoesNotExists
        }

        let modeConfig = config.modes[gamemode]
        for (let setting of modeConfig.settings) {
            if (!this.settings[setting]) {
                this.settings[setting] = config.settings[setting].default
            }
        }

        this.settings.mode = gamemode
    }

    nextPhase(lastPhaseData: any = null) {
        this.phaseIndex++
        if (config.modes[this.settings.mode].phases[this.phaseIndex]) {
            // this.phase = config.modes[this.settings.mode].phases[this.phaseIndex]
        } else {
            this.end()
        }

        switch (this.phase.name) {
            case "vote-questions":
                // this.phase = new GamePhase.phases["vote-questions"](this, lastPhaseData)
                break;
            default:
                // this.phase = new GamePhase.phases[this.phase](this)
                break;
        }

        this.broadcast("gameUpdate", this.getStatus())
    }

    getSettings() {
        let output = {}
        for (let setting of config.modes[this.settings.mode].settings) {
            let value = this.settings[setting]
            let data = config.settings[setting]
            output[setting] = {
                value,
                type: data.type,
                name: data.name,
                icon: data.icon,
                default: data.default,
            }
        }
        // output.mode = this.settings.mode
        return output
    }

    end() {
        this.phase = new SummaryGamePhase(this,)
    }

    retrieve = async (inEvent: string, outEvent: string) => {
        return await Promise.all(
            this.users.map(user =>
                new Promise<{ user: User, value: any }>((resolve) => {
                    user.client.emit(inEvent)
                    user.client.on(outEvent, (...args) => {
                        resolve({ user, value: args })
                    })

                    setTimeout(() => {
                        resolve({ user, value: null })
                    }, 5000)
                })
            )
        )
    }
}
import { UserResolvable } from "./user"

export type GameMode = "normal"

export interface GameSettings{
    mode: GameMode
    "random-questions"?: boolean
}

export interface GameResolvable{
    users: UserResolvable[]
    phaseIndex: number
    // phase: 
    id: string
    settings: GameSettings
}
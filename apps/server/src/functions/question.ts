import { randomQuestion } from "./misc"
import User from "./user"

export default class Question {
    asker: User
    question: string

    constructor(asker: User, question: string) {
        this.asker = asker

        if (!question && asker.game?.settings["random-questions"]) {
            question = randomQuestion()
        }

        if (!question.endsWith("?")) question += " ?"
        this.question = question
    }
}
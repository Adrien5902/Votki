const { randomQuestion } = require("./misc")
const User = require("./user")

module.exports = class Question{
    /**
     * @param {User} asker 
     * @param {string | null} question 
     */
    constructor(asker, question){
        this.asker = asker
        

        if(!input && asker.game.settings["random-questions"]){
            input = randomQuestion()
        }

        if(!question.endsWith("?")) question += " ?"
        this.question = question
    }
}
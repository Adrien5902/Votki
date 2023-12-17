import { createContext, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGithub } from "@fortawesome/free-brands-svg-icons"
import Content from "../components/Content"
import Socket from "../socket"
import { UserResolvable } from "votki-shared-types/src/user"
import { GameResolvable } from "votki-shared-types/src/game"


const socket = new Socket(import.meta.env.DEV ? "http://localhost:3002" : "http://adrien5902.ddns.net:3000/")

export const SocketContext = createContext(socket)

function App() {
    const [user, setUser] = useState<UserResolvable>(null)
    const [game, setGame] = useState<GameResolvable>(null)

    return (
        <SocketContext.Provider value={socket}>
            <Content />
            <div id="error-popups"></div>
            <a id="github-link" href="https://github.com/Adrien5902/Votki" target="_blank">
                <FontAwesomeIcon icon={faGithub} />
            </a>
        </SocketContext.Provider>
    )
}

export default App

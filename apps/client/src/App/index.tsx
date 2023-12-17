import { createContext, useState } from "react"
import { Manager } from "socket.io-client"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGithub } from "@fortawesome/free-brands-svg-icons"
import Content from "../components/Content"
import Socket from "../socket"
import { UserResolvable } from "../../../shared/user"

const socket = new Socket(new Manager("http://adrien5902.ddns.net:3000/"))

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

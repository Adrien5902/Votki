import { useState } from "react";
import { ChooseName } from "./ChooseName";
import { CreateGame } from "./CreateGame";
import { GameJoin } from "./GameJoin";
import { GameSettings } from "./GameSettings";
import { PlayerList } from "./PlayerList";
import { socket } from "../functions";

const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

export function Content() {
    const [args, setArgs] = useState([])
    const [type, setType] = useState("connecting")
    const [username, setUsername] = useState("")
    const [avatar, setAvatar] = useState("")

    function display(type, ...args){
        setArgs(args)
        setType(type)
    }

    socket.on(socket.on("connect", () => {
        if(params.game){
            let gameId = params.game
            display("join-game", gameId)
        }else{
            display("create-game")
        }
    }))

    const types = {
        "connecting": () => (
            <h2 id="connecting" className="tripledotloading">Connexion au serveur</h2>
        ),
        "create-game": (name = null, avatar = null) => (<>
            <ChooseName setUsername={setUsername} name={name} setAvatar={setAvatar} avatar={avatar}/>
            <CreateGame username={username} setUsername={setUsername} display={display}/>
        </>),
        "join-game": (gameId) => (<>
            <ChooseName setUsername={setUsername} setAvatar={setAvatar} />
            <GameJoin gameId={gameId} username={username} avatar={avatar} display={display}/>
        </>),
        "game-lobby": (gameId, users, settings = null) => (<>
            <PlayerList users={users}/>
            <GameSettings gameId={gameId} settings={settings}/>
        </>),
    }

    return (
        <div id="content">
            {args ? types[type](...args) : types[type]()}
        </div>
    );
}
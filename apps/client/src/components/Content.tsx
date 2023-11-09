import { useContext, useState } from "react";
import { ChooseName } from "./ChooseName";
import { CreateGame } from "./CreateGame";
import { GameJoin } from "./GameJoin";
import { PlayerList } from "./PlayerList";
import { SocketContext } from "../App";
import { UserResolvable } from "../../../shared/user"
import { GameResolvable } from "../../../shared/game"
import { GameSettingsElement } from "./GameSettings";

const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

interface Props{
    user: UserResolvable
    setUser: React.Dispatch<UserResolvable>
    game: GameResolvable
    setGame: React.Dispatch<GameResolvable>
}

export default function Content({
    user,
    setUser,
    game,
    setGame,
}: Props ) {
    function display(type, ...args){
        // setArgs(args)
        // setType(type)
    }

    const socket = useContext(SocketContext)

    // setUser(socket.send())

    const types = {
        "connecting": () => (
            <h2 id="connecting" className="tripledotloading">Connexion au serveur</h2>
        ),
        "create-game": (name = null, avatar = null) => (<>
            <ChooseName setUsername={setUsername} name={name} setAvatar={setAvatar} avatar={avatar}/>
            <CreateGame username={username} setUsername={setUsername} display={display}/>
        </>),
        "game-lobby": (gameId, users, settings = null) => (<>
            <PlayerList users={users}/>
            <GameSettingsElement gameId={gameId} settings={settings}/>
        </>),
    }

    return (
        <div id="content">
            
        </div>
    );
}
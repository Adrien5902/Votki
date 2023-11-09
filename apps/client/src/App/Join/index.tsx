"use client"

import { ChooseName } from "../ChooseName";
import { GameJoin } from "../GameJoin";

function JoinGame() {
    return (
        <>
        <ChooseName setUsername={setUsername} setAvatar={setAvatar} />
        <GameJoin gameId={gameId} username={username} avatar={avatar} display={display}/>
        </>
    );
}

export default JoinGame;
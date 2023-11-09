import { useState } from "react";
import { GameRules } from "./GameRules.jsx";
import { Invite } from "./Invite.jsx";

function startGame(){
    request("startGame")
}

export function GameSettings(props) {
    let {gameId} = props

    const [settings, setSettings] = useState(props.settings ?? null)
    if(!settings){
        request("getGameSettings", setSettings)
    }

    const inviteLink = `https://adrien5902.ddns.net/votki/src/?game=${gameId}`

    return (
        <div id="game-settings" className="box">
            <h2><i className="fa-solid fa-gears"></i> Paramètres de la partie : </h2>
            <div>
                <h3><i className="fa-solid fa-gamepad"></i> Mode :</h3>
                <div id="modes"></div>
            </div>
            
            <GameRules settings={settings} />
            
            <Invite inviteLink={inviteLink} />
            
            <button id="start-game" onClick={startGame}>
                <i className="fa-solid fa-play"></i> <span>Lancer la partie</span>
            </button>
        </div>
    );
}
import { useState } from "react";
import { User } from "./User";

export function PlayerList({users: u}) {
    const [users, setUsers] = useState(u)

    socket.on("playersChanged", (u) => {setUsers(u); console.log(u)})

    return (
        <div id="player-list-container" className="box">
            <h3><i className="fa-solid fa-users"></i> Joueurs :</h3>
            <div id="player-list">
                { users.map((user, i) => <User key={i} user={user}/>) }
            </div>
        </div>
    );
}
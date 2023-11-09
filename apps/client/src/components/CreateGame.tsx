export function CreateGame({ username, setUsername, display }) {
    const createGameHandler = () => {
        let name = username ? username : null
        request("createGame", info => {
            if(info && info.id){
                setUsername(info.username)
                display("game-lobby", info.id, info.status.users)
            }
        }, name)
    }

    return (
        <div id="create-game" className="box">
            <h2>Pour jouer commencez par :</h2>
            <button onClick={createGameHandler}>Créer une partie</button>
        </div>
    );
}


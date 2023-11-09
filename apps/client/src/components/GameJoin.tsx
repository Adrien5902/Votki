export function GameJoin({ gameId, username, avatar, display }) {
    function handleClick(e){
        request("rename", null, username);

        request("join", (joined) => {
            if (!joined) {
                display("create-game", username, avatar)
                return;
            }

            request("getGameStatus", (gameStatus) => {
                if (!gameStatus) {
                    display("create-game", username, avatar)
                    return;
                }

                display("game-lobby", gameId, gameStatus.users);
            });
        }, gameId);
    }

    return (
        <button id="join-button" onClick={handleClick}>Rejoindre la partie !</button>
    );
}

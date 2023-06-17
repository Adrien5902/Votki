const socket = io('https://adrien5902.ddns.net:3002');
const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

function request(event, cb, ...arg){
    socket.emit(event, ...arg)
    socket.on(event, (...res)=>{
        socket.off(event)
        if(typeof cb == "function"){
            cb(...res)
        }
    })
}

/**
 * @param {string | string[]} menu 
 */
function display(menu = "main", CSSclass = "displayed"){
    document.querySelectorAll("."+CSSclass).forEach(el => {
        if(!el.classList.contains("swap")){
            el.classList.remove(CSSclass)
        }else{
            setTimeout(()=>{
                el.classList.remove(CSSclass)
            }, 1000)
        }
    })

    if(!Array.isArray(menu)){
        menu = [menu]
    }

    menu.forEach(m => {
        document.getElementById(m).classList.add(CSSclass)
    })
}

function showCreateGameMenu(){
    createGameBtn = document.querySelector("#create-game button")
    display(["choose-name", "create-game"])

    createGameBtn.onclick = () => {
        request("createGame", gameId => {
            if(gameId){
                console.log("join at https://adrien5902.ddns.net/votki/?game="+gameId)
                display(["choose-name", "create-game"], "swap")
                display(["game-settings", "player-list"])
            }
        })
    }
}

function tryGameJoin(gameId){
    request("join", joined => {
        if(!joined){
            showCreateGameMenu()
            return
        }

        request("getGameStatus", (gameStatus) => {
            if(!gameStatus){
                showCreateGameMenu()
                return
            }

            display(["game-settings", "player-list"])

            console.log("joined game " + gameId)
            console.dir(gameStatus)
        })
    }, gameId)
}

function displayUsers(users){
    users.forEach(user => {
        let userDiv = document.createElement("div")
        document.getElementById("player-list").appendChild(userDiv)
        
        userDiv.innerHTML = `
            <img src="avatars/${user.avatar}.png">
            <span class="username">${user.name}</span>
        `;
    });
}

socket.on("connect", () => {
    if(params.game){
        let gameId = params.game
        tryGameJoin(gameId)
    }else{
        showCreateGameMenu()
    }
});
const connecting = document.getElementById("connecting"),
connectionError = document.getElementById("connection-error")

connecting.style.display = "none"

if(typeof io == "undefined"){
    connectionError.style.display = "block"
}

const socket = io('https://adrien5902.ddns.net:3002');
const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

const errorPopups = document.getElementById("error-popups")
/** @param {string} err  */
function error(err){
    let errorDiv = document.createElement("div")
    document.body.appendChild(errorDiv)

    errorDiv.innerHTML = 
    `<i class="fa-solid fa-triangle-exclamation"></i>
    <span>${err}</span>`

    errorPopups.appendChild(errorDiv)
    setTimeout(()=>{
        errorPopups.removeChild(errorDiv)
    }, 5000)
}


let username
let usernameInput = document.getElementById("username")

/**
 * @param {string} event 
 * @param {function} cb 
 * @param  {...any} arg 
 */
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
 * @param {Object} button 
 * @returns {HTMLButtonElement}
 */
function createButton(button){
    let btn = document.createElement("button")
    btn.innerHTML = button.text

    if(button.style)
    btn.setAttribute("style", button.style)

    btn.addEventListener("click", e => {
        if(button.action)
        button.action()
    })
    return btn
}

/**
 * @param {HTMLElement} el 
 * @param {Object[]} buttons 
 */
function addRightClick(el, buttons){
    el.addEventListener("contextmenu", e => {
        e.preventDefault();

        let contextMenu = document.getElementById("context-menu")
        if(contextMenu)
        contextMenu.remove()
    
        const { clientX: mouseX, clientY: mouseY } = e;
    
        contextMenu = document.createElement("div")
        contextMenu.id = "context-menu"
        document.body.appendChild(contextMenu)

        contextMenu.style.top = `${mouseY}px`;
        contextMenu.style.left = `${mouseX}px`;

        for(let button of buttons){
            let btn = createButton(button)

            btn.addEventListener("click", e => {
                contextMenu.remove()
            })
            
            contextMenu.appendChild(btn)
        }

        const closeContextMenu = () => {
            contextMenu.remove()
            document.body.removeEventListener("click", closeContextMenu)
        }
        document.body.addEventListener("click", closeContextMenu)
    })
}

/**CSSclass
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
        let name = usernameInput.value ? usernameInput.value : null

        request("createGame", info => {
            if(info && info.id){
                console.log(info)
                username = info.username
                display(["choose-name", "create-game"], "swap")
                display(["game-settings", "player-list-container"])
                displayGameInvite(info.id)
                displayPlayers(info.status.users, username)
                request("getGameSettings", displaySettings)
            }
        }, name)
    }
}

function displaySettings(settings){
    let modes = document.querySelectorAll("#modes > *")
    modes.forEach(el => el.removeAttribute("selected"))

    let selectedMode = document.querySelector(`[mode="${settings.mode}"]`)
    selectedMode.setAttribute("selected", "")

    let gameRules = document.getElementById("game-settings-rules")
    gameRules.childNodes.forEach(el => {if(el.style){el.style.display = "none"}})
    for(let setting of Object.keys(settings)){
        if(setting != "mode"){
            let data = settings[setting]
            let el = gameRules.querySelector(`[setting=${setting}]`)

            if(!el){
                let div = document.createElement("div")
                div.setAttribute("setting", setting)
                gameRules.appendChild(div)
    
                switch(data.type){
                    case("boolean"): 
                        let checkBox = document.createElement("custom-checkbox")
                        checkBox.setAttribute("checked", String(data.value))
                        div.appendChild(checkBox)
                            
                        customCheckBox(checkBox, false, (state) => {
                            request("setGameSetting", null, setting, state)
                        })
    
                        break
                }
    
                let label = document.createElement("label")
                label.innerHTML = data.name
                div.appendChild(label)
            }else{
                el.style.display = ""
                switch(data.type){
                    case("boolean"): 
                        let checkBox = el.querySelector("custom-checkbox")
                        checkBox.setAttribute("checked", String(data.value))
                }
            }
        }
    }
}

/**
 * @param {string} gameId
 */
function tryGameJoin(gameId) {
    display(["choose-name", "game-join"]);
    let joinBtn = document.getElementById("join-button");

    joinBtn.onclick = () => {
        let name = usernameInput.value ? usernameInput.value : null;
        display(["choose-name", "game-join"], "swap");
        request("rename", (un) => { username = un; }, name);

        request("join", (joined) => {
            if (!joined) {
                showCreateGameMenu();
                return;
            }

            request("getGameStatus", (gameStatus) => {
                if (!gameStatus) {
                    showCreateGameMenu();
                    return;
                }

                display(["game-settings", "player-list-container"]);
                displayGameInvite(gameId);

                request("getGameSettings", displaySettings);
            });
        }, gameId);
    };
}

/**
 * @param {string} gameId 
 */
function displayGameInvite(gameId){
    let invite = `https://adrien5902.ddns.net/votki/?game=${gameId}`

    if (history.pushState) {
        let newurl = invite;
        window.history.pushState({path:newurl},'',newurl);
    }

    let inviteLink = document.querySelector("#invite-link > span")
    let copyBtn = document.querySelector("#invite-link > button")
    
    inviteLink.innerHTML = invite

    copyBtn.onclick = () => {
        navigator.clipboard.writeText(invite)
        copyBtn.style.background = "var(--accent)"
        copyBtn.style.borderColor = "var(--accent)"
        copyBtn.innerHTML = '<i class="fa-solid fa-clipboard-check"></i> Copié'

        setTimeout(()=>{
            copyBtn.style.background = ""
            copyBtn.style.borderColor = ""
            copyBtn.innerHTML = '<i class="fa-solid fa-clipboard"></i> Copier'
        },1000)
    }

    inviteLink.onmouseleave = () => inviteLink.scrollLeft = 0
}

let playerList = document.getElementById("player-list")
/**
 * @param {any[]} users 
 */
function displayPlayers(users, username){
    playerList.innerHTML = ""
    users.forEach(user => {
        let userDiv = document.createElement("div")
        userDiv.classList.add("user")
        playerList.appendChild(userDiv)
        userDiv.setAttribute("grade", String(user.grade))

        userDiv.innerHTML += `<div class="user-main">
            <img src="avatars/${user.avatar}" class="pdp" draggable="false">
            <span class="username">${user.name}</span>
        </div>`;
        
        if(user.grade >= 1)
        userDiv.innerHTML += '<i class="fa-solid fa-crown user-grade"></i>'

        if(user.name == username){
            userDiv.setAttribute("you", "")
        }/* else{
            addRightClick(userDiv, [
                {
                    text: '<i class="fa-solid fa-arrows-up-to-line"></i> Promouvoir',
                    action: () => {
                        request("promote")
                    }
                }
            ])
        } */
    });
}

socket.on("connect", () => {
    connecting.style.display = "none"
    if(params.game){
        let gameId = params.game
        tryGameJoin(gameId)
    }else{
        showCreateGameMenu()
    }

    socket.on("disconnect", (reason) => {
        switch (reason) {
            case "io server disconnect":
                console.error("Vous avez été kick")
                socket.connect()
                showCreateGameMenu()
                break;
        
            case "ping timeout":
                socket.connect()
                connecting.style.display = "block"
                break;
        
            default:
                break;
        }
    })
});
socket.on("playersChanged", (users) => {
    displayPlayers(users, username)
})
socket.on("settingsChanged", displaySettings)

request("getGameModes", modes => {
    let modesContainer = document.getElementById("modes")
    for(let mode of Object.keys(modes)){
        let m = modes[mode]
        
        let modeDiv = document.createElement("div")
        modeDiv.classList.add("flip")
        modeDiv.setAttribute("mode", mode)

        if(m.default)
        modeDiv.setAttribute("selected", "")

        modeDiv.innerHTML = 
        `<span class="flip-front">${m.name}</span>
        <span class="flip-back">${m.description}</span>`

        modesContainer.appendChild(modeDiv)
        
        modeDiv.onclick = () => {
            request("setGameMode", null, mode)
        }
    }
})

socket.on("error", error)

/**
 * @param {HTMLElement} el 
 * @param {boolean} updateOnClick 
 * @param {function} cb 
 */
function customCheckBox(el, updateOnClick = true, cb = () => {}){
    let i = document.createElement("i")
    i.classList.add("fa-check", "fa-solid")
    el.appendChild(i)
    
    function update(state){
        el.setAttribute("checked", String(state))
    }

    update(el.getAttribute("checked") == "true")

    el.onclick = () => {
        let state = el.getAttribute("checked") != "true"

        if(updateOnClick){
            update(state)
        }

        if(typeof cb == "function"){
            cb(state)
        }
    }
}

function getRandomAvatar(){
    request("getRandomAvatar", (avatar) => {
        document.getElementById("avatar").src = "avatars/"+avatar
    })
}

let rerollAvatar = document.getElementById("reroll-avatar")
rerollAvatar.onclick = () => {
    getRandomAvatar()
    rerollAvatar.animate([
        {
            transform: "rotate(0deg)"
        },
        {
            transform: "rotate(-360deg)"
        }
    ], {duration : 150})
}
getRandomAvatar()

document.getElementById("start-game").onclick = () => {
    request("startGame")
}

socket.on("gameUpdate", (status) => {
    switch (status) {
        case "ask-questions":
            
            break;
    }
})
export const socket = io('https://adrien5902.ddns.net:3002');

/**
 * @param {string} event 
 * @param {function} cb 
 * @param  {...any} arg 
 */
export function request(event, cb, ...arg){
    socket.emit(event, ...arg)
    socket.on(event, (...res)=>{
        socket.off(event)
        if(typeof cb == "function"){
            cb(...res)
        }
    })
}
import { io } from "socket.io-client";
export const socket = io(import.meta.env.DEV ? "http://localhost:3002" : 'https://adrien5902.ddns.net:3002');

export function request(event: string, cb?: (...args: any) => unknown, ...arg: any) {
    socket.emit(event, ...arg)
    socket.on(event, (...res) => {
        socket.off(event)
        if (typeof cb == "function") {
            cb(...res)
        }
    })
}
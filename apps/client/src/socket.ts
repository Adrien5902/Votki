import { Manager, Socket as io } from "socket.io-client";

export default class Socket extends io {
    constructor(url: string) {
        super(new Manager(url), "")
    }
}
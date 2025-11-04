import io from 'socket.io-client'


export const createSocketConnection = () => {
    return io('http://localhost:3000', {
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        transports: ["websocket"],
    })
}
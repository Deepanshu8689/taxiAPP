import io from 'socket.io-client'


export const createSocketConnection = () => {
    return io('http://localhost:3000', {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 9999,
        reconnectionDelay: 1000,
    })
}
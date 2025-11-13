import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { RideRepository } from '../ride/ride.respository';
import { JwtService } from '@nestjs/jwt';
import { SocketService } from '../socket/socket.service';
import { Server, Socket } from 'socket.io';
import * as cookie from 'cookie';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  },
  transports: ['websocket']
})

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(
      private rideReop: RideRepository,
      private jwtService: JwtService,
      private socketService: SocketService,
      private chatService: ChatService
    ) { }
  
    @WebSocketServer()
    io: Server
  
    afterInit(server: Server) {
      console.log('WebSocket server initialized');
    }
  
    async handleConnection(client: Socket) {
      try {
        const rawCookie = client.handshake.headers?.cookie || '';
        if (!rawCookie) {
          console.log("No cookie found, disconnecting...")
          client.disconnect();
          return;
        }
  
        const parsed = cookie.parse(rawCookie);
        const token = parsed.token;
  
        if (!token) {
          console.log("No token found in cookie, disconnecting...")
          client.disconnect();
          return;
        }
  
        const decoded = await this.jwtService.verifyAsync(token)
        const userId = decoded.sub
        const role = decoded.role
  
        if (!userId) {
          console.log("No userId found in token, disconnecting...")
          client.disconnect();
          return;
        }
  
        client.data.user = { id: String(userId), role, payload: decoded }
        await this.socketService.saveConnection(String(userId), role, client.id)
        client.join(`${userId}_${role}`)
  
      } catch (error) {
        console.log("error in handleConnection: ", error)
        client.disconnect();
        throw error
      }
    }
  
    async handleDisconnect(client: Socket) {
      try {
  
        await this.socketService.removeConnectionBySocketId(client.id)
  
      } catch (error) {
        console.log("error in handleDisconnect: ", error)
        throw error
      }
    }

  @SubscribeMessage('BE-join-chat')
  handleJoinChat(
    @MessageBody() data: { sender: any, receiver: any },
    @ConnectedSocket() socket: Socket
  ) {
    return 'Hello world!';
  }
}
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RideRepository } from './ride.respository';
import { JwtService } from '@nestjs/jwt';
import { SocketService } from '../socket/socket.service';
import * as cookie from 'cookie';
// import { Server } from 'http';


@WebSocketGateway({
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  },
  transports: ['websocket', 'polling']
})

@WebSocketGateway()
export class RideGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {


  constructor(
    private rideReop: RideRepository,
    private jwtService: JwtService,
    private socketService: SocketService,
    private rideRepo: RideRepository
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


  @SubscribeMessage('BE-request-ride')
  async handleRequestRide(
    @MessageBody() ride: any,
    @ConnectedSocket() socket: Socket
  ) {
    try {
      if (!ride) {
        throw new Error('Ride not found in gateway')
      }

      const drivers = await this.rideReop.findDrivers(ride._id)

      for (const driver of drivers) {
        const socketId = await this.socketService.getSocketIdByUserId(String(driver._id))
        if (socketId) {
          this.io.to(socketId).emit('FE-new-ride', ride)
        }
      }
      return {
        message: 'Ride broadcasted to drivers',
        ok: true
      };
      
    } catch (error) {
      console.log("error in handleRequestRide: ", error)
      throw error
    }
  }

  @SubscribeMessage('BE-ride-cancel')
  async handleRideCancelled(
    @MessageBody() ride: any,
    @ConnectedSocket() socket: Socket
  ) {
    try {
      
      const drivers = await this.rideReop.findDrivers(ride._id)
      await this.rideRepo.cancelRide(ride._id)

      for (const driver of drivers) {
        const socketId = await this.socketService.getSocketIdByUserId(String(driver._id))
        if (socketId) {
          this.io.to(socketId).emit('FE-ride-cancelled', ride._id)
        }
      }
      
    } catch (error) {
      console.log("error in handleRideCancelled: ", error)
      throw error
    }
  }
  @SubscribeMessage('BE-ride-accept')
  async handleRideAccepted(
    @MessageBody() ride: any,
    @ConnectedSocket() socket: Socket
  ) {

    try {
      if (!ride) {
        throw new Error('Ride not found in gateway')
      }
      const rider = ride.rider
      const driver = ride.driver

      console.log("driver in accept-ride: ", driver)
      console.log("rider in accept-ride: ", rider)

      const riderSocketId = await this.socketService.getSocketIdByUserId(rider)

      if(riderSocketId){
        this.io.to(riderSocketId).emit('FE-ride-accepted', ride)
      }
      else{
        console.log("Rider not connected via socket")
      }

      return { message: 'Ride accepted by driver', ride };
    } catch (error) {
      console.log("error in handleRideAccepted: ", error)
      throw error
    }
  }

  @SubscribeMessage('BE-update-distance')
  async handleUpdateDistance(
    @MessageBody() data: any,
    @ConnectedSocket() socket: Socket
  ) {
    try {
      console.log("data: ", data)

      const { lat, long, distance, duration, ride } = data
      const rider = ride.rider._id

      this.io.to(`rider_${rider}`).emit('FE-update-distance', { distance, duration })

    } catch (error) {
      console.log("error in handleUpdateDistance: ", error)
      throw error
    }
  }

}

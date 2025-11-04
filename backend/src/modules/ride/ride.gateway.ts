import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RideService } from './ride.service';
import { RideRepository } from './ride.respository';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/common/decorators/req-user.decorator';
// import { Server } from 'http';


@WebSocketGateway({
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
})

@WebSocketGateway()
export class RideGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {


  constructor(
    private rideReop: RideRepository,
    private jwtService: JwtService
  ) { }

  private connectedDrivers = new Map<string, { id: string; socket: Socket }>();
  private connectedRiders = new Map<string, { id: string; socket: Socket }>();

  @WebSocketServer()
  io: Server

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
    // this.users[client.id] = client.id;
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id)
    this.connectedDrivers.delete(client.id)
    this.connectedRiders.delete(client.id)
  }

  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() data: any,
    @ConnectedSocket() socket: Socket
  ) {
    try {
      if (data) {
        if (data.role === 'driver') {
          this.connectedDrivers.set(socket.id, { id: data._id || data.sub, socket })
          socket.join(`driver_${data.sub || data._id}`)
        }
        else {
          this.connectedRiders.set(socket.id, { id: data._id || data.sub, socket });
          socket.join(`rider_${data.sub || data._id}`)
        }
      }
      else {
        console.log("retrying....")
      }

      console.log(`${data?.role} registered: ${data?._id || data?.sub}`);
    } catch (error) {
      console.log("error in handleRegister: ", error)
      throw error
    }
  }

  @SubscribeMessage('BE-request-ride')
  async handleRequestRide(
    @MessageBody() ride: any,
    @ConnectedSocket() socket: Socket
  ) {
    try {
      const drivers = await this.rideReop.findDrivers(ride._id)

      for (const driver of drivers) {
        for (const [socketId, info] of this.connectedDrivers) {
          if (info.id === String(driver._id)) {
            console.log("socketId in request-ride: ", socketId)
            this.io.to(socketId).emit('FE-new-ride', ride)
          }
        }
      }
      return { message: 'Ride broadcasted to drivers', ride };
    } catch (error) {
      console.log("error in handleRequestRide: ", error)
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


      for (const [socketId, info] of this.connectedDrivers) {
        if (info.id === String(driver._id)) {
          console.log("socketId in accept-ride: ", socketId)
          this.io.to(socketId).emit('FE-driver-accepted', ride)
        }
        else {
          this.io.to(socketId).emit('FE-driver-rejected')
        }
      }

      this.io.to(`rider_${rider._id}`).emit('FE-ride-accepted', ride);
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
  ){
    try {
      console.log("data: ", data)

      const { lat, long, distance, duration, ride  } = data
      const rider = ride.rider._id

      this.io.to(`rider_${rider}`).emit('FE-update-distance', { distance, duration })

    } catch (error) {
      console.log("error in handleUpdateDistance: ", error)
      throw error
    }
  }

}

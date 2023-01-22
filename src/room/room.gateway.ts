import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { randomUUID } from 'crypto';
import { Server, Socket } from 'socket.io';
import { RoomDTO } from 'src/dto/roomDTO';
import { RoomService } from './room.service';

@WebSocketGateway({ cors: true })
class RoomGateway implements  OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly roomService: RoomService) {}

  async handleConnection(client: Socket) {
    console.log("RoomGateway --- Connected");
    console.log('Player Name: ' + client.handshake.query.userName)
    console.log('Player Language: ' + client.handshake.query.language)
  }

  async handleDisconnect(client: Socket) {

  }

  @SubscribeMessage('createRoom')
  createRoom(@MessageBody() data: {clientId: string, roomName: string}) {
    console.log("creating room: clientid: " +data.clientId + ", roomName: " +data.roomName)
    this.roomService.createRoom(data.clientId, data.roomName);
  }

  @SubscribeMessage('listRooms')
  listRooms(@ConnectedSocket() client) {
    console.log("listing rooms...")
    this.roomService.listRooms(client);
  }
}

export { RoomGateway };

import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { RoomService } from './room.service';

@WebSocketGateway({ cors: true })
class RoomGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly roomService: RoomService) {}

  @SubscribeMessage('createRoom')
  createRoom(@MessageBody() data: { clientId: string; roomName: string }) {
    console.log(
      'creating room: clientid: ' +
        data.clientId +
        ', roomName: ' +
        data.roomName,
    );
    this.roomService.createRoom(data.clientId, data.roomName);
  }

  @SubscribeMessage('listRooms')
  listRooms(@ConnectedSocket() client) {
    console.log('listing rooms...');
    this.roomService.listRooms(client);
  }
}

export { RoomGateway };

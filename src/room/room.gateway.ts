import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { RoomService } from './room.service';
import { WEBSOCKET_CHANNELS } from '../models/enums/websocket-channels';
import { CreateRoomDTO } from '../dto/createRoomDTO';
import { RoomDTO } from '../dto/roomDTO';
import { JoinRoomDTO } from '../dto/joinRoomDTO';

@WebSocketGateway({ cors: true })
class RoomGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly roomService: RoomService) {}

  @SubscribeMessage(WEBSOCKET_CHANNELS.CREATE_ROOM)
  createRoom(@MessageBody() createRoomDTO: CreateRoomDTO) {
    console.log(
      'creating room: clientid: ' +
        createRoomDTO.clientId +
        ', roomName: ' +
        createRoomDTO.roomName,
    );
    this.roomService.createRoom(createRoomDTO, this.server);
  }

  @SubscribeMessage(WEBSOCKET_CHANNELS.LIST_ROOMS)
  listRooms() {
    console.log('listing rooms...');
    this.roomService.listRooms(this.server);
  }

  @SubscribeMessage(WEBSOCKET_CHANNELS.SET_ROOM_NAME)
  setRoomName(@ConnectedSocket() socket, @MessageBody() roomDTO: RoomDTO) {
    console.log('listing rooms...');
    this.roomService.setRoomName(socket, roomDTO, this.server);
  }

  @SubscribeMessage(WEBSOCKET_CHANNELS.JOIN_ROOM)
  joinRoom(@ConnectedSocket() socket, @MessageBody() joinRoomDTO: JoinRoomDTO) {
    console.log('listing rooms...');
    this.roomService.assignUserToRoom(socket, joinRoomDTO, this.server);
  }
}

export { RoomGateway };

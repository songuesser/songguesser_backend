import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
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
class RoomGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(private readonly roomService: RoomService) {}

  handleConnection() {
    this.listRooms();
  }

  @SubscribeMessage(WEBSOCKET_CHANNELS.CREATE_ROOM)
  createRoom(@MessageBody() createRoomDTO: CreateRoomDTO) {
    this.roomService.createRoom(createRoomDTO, this.server);
  }

  @SubscribeMessage(WEBSOCKET_CHANNELS.LIST_ROOMS)
  listRooms() {
    this.roomService.listRooms(this.server);
  }

  @SubscribeMessage(WEBSOCKET_CHANNELS.SET_ROOM_NAME)
  setRoomName(@ConnectedSocket() socket, @MessageBody() roomDTO: RoomDTO) {
    this.roomService.setRoomName(socket, roomDTO, this.server);
  }

  @SubscribeMessage(WEBSOCKET_CHANNELS.JOIN_ROOM)
  joinRoom(@ConnectedSocket() socket, @MessageBody() joinRoomDTO: JoinRoomDTO) {
    this.roomService.assignUserToRoom(socket, joinRoomDTO, this.server);
  }

  @SubscribeMessage(WEBSOCKET_CHANNELS.LEAVE_ROOM)
  leaveRoom(@ConnectedSocket() socket) {
    this.roomService.leaveRoom();
  }
}

export { RoomGateway };

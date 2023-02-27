import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Room } from '../models/room';
import { RoomDTO } from '../dto/roomDTO';
import { UserService } from '../user/user.service';
import { randomUUID } from 'crypto';
import { WEBSOCKET_CHANNELS } from '../models/enums/websocket-channels';
import { CreateRoomDTO } from '../dto/createRoomDTO';
import { User, UserWithOutSocket } from '../models/user';
import { JoinRoomDTO } from '../dto/joinRoomDTO';

@Injectable()
export class RoomService {
  activeRooms: Room[] = [];
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  createRoom = async (createRoomDTO: CreateRoomDTO, server: Server) => {
    const { clientId, roomName } = createRoomDTO;
    const userSocket = this.userService.getUserInformation(
      createRoomDTO.clientId,
    ).socket;

    const user = this.userService.getUserInformation(clientId);

    const admin: UserWithOutSocket = {
      userId: user.userId,
      username: user.username,
    };

    const room: Room = {
      roomId: randomUUID(),
      roomName: roomName,
      players: [],
      admin: admin,
    };

    if (this._checkForDuplicateRoom(roomName)) {
      userSocket.emit('Roomname is already used');
    }

    this.activeRooms.push(room);
    userSocket.join(room.roomId);
    userSocket.emit(WEBSOCKET_CHANNELS.CREATE_ROOM, {
      roomId: room.roomId,
      roomName: room.roomName,
    });
    this.listRooms(server);
  };

  setRoomName = (socket: Socket, roomDTO: RoomDTO, server: Server) => {
    const currentRoom = this.getRoomInformation(roomDTO.roomId);
    if (currentRoom == undefined) {
      // throw error room does not exist
      return;
    }

    const currentRoomsUpdates = this.activeRooms.map((room) =>
      room.roomId == roomDTO.roomId
        ? {
            ...room,
            roomName: roomDTO.roomName,
          }
        : room,
    );

    this.activeRooms = currentRoomsUpdates;

    const renamedRoom: Room = {
      roomId: roomDTO.roomId,
      roomName: roomDTO.roomName,
      ...currentRoom,
    };

    this.updateRoom(renamedRoom);

    socket
      .to(roomDTO.roomId)
      .emit(WEBSOCKET_CHANNELS.SET_ROOM_NAME, { name: roomDTO.roomName });
    this.listRooms(server);
  };

  removeRoom = (roomName: string) => {
    this.activeRooms = this.activeRooms.filter(
      (room) => room.roomId == roomName,
    );
  };

  assignUserToRoom = (
    socket: Socket,
    joinRoomDTO: JoinRoomDTO,
    server: Server,
  ) => {
    const { roomId } = joinRoomDTO;
    const room: Room = this.getRoomInformation(roomId);
    if (room == undefined) {
      // throw error room does not exist
      return;
    }

    const user: User = this.userService.getUserInformation(socket.id);
    const players = room.players;

    if (!players.map((player) => player.userId).includes(user.userId)) {
      players.push({
        userId: user.userId,
        username: user.username,
        points: 0,
        guessedSong: undefined,
        selectedSong: undefined,
        hasGuessed: false,
      });
    }
    socket.join(roomId);
    const roomWithNewPlayer: Room = { ...room, players: players };

    this.updateRoom(roomWithNewPlayer);
    this.listRooms(server);
  };

  //Returns undefined if room does not exist,
  // returns room object if it exists
  getRoomInformation = (roomId: string): Room =>
    this.activeRooms.find((room) => room.roomId == roomId);

  private _checkForDuplicateRoom = (roomName: string) =>
    this.activeRooms.some((room) => room.roomName == roomName);

  listRooms = (server?: Server, socket?: Socket) => {
    if (socket) {
      socket.emit(WEBSOCKET_CHANNELS.LIST_ROOMS, { rooms: this.activeRooms });
    } else {
      server.emit(WEBSOCKET_CHANNELS.LIST_ROOMS, { rooms: this.activeRooms });
    }
  };

  updateRoom = (newRoom: Room) => {
    const currentRoomsUpdates = this.activeRooms.map((room) =>
      room.roomId == newRoom.roomId ? newRoom : room,
    );

    this.activeRooms = currentRoomsUpdates;
  };

  leaveRoom = () => {};
}

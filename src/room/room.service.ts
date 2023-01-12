import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { Room } from '../models/room';
import { RoomDTO } from '../dto/roomDTO';
import { UserService } from '../user/user.service';

@Injectable()
export class RoomService {
  activeRooms: Array<Room>;
  defaultRoom: Room;
  userService: UserService;

  constructor(private uS: UserService) {
    this.activeRooms = new Array<Room>();
    this.defaultRoom = new Room('0', 'Entrance');
    this.activeRooms.push(this.defaultRoom);
    this.userService = uS;
  }

  createRoom = (clientId: string, roomName: string) => {
    console.log('userService: ' + this.userService);

    const room: Room = {
      roomId: 'ABCD',
      roomName: roomName,
      socket: this.userService.getUserInformation(clientId).socket,
    };

    if (this._checkForDuplicateRoom(roomName)) {
      console.log('Roomname is already used');
      room.socket.emit('Roomname is already used');
    }

    this.activeRooms.push(room);
    console.log(roomName + ' was created!');
    room.socket.emit('roomCreated', {
      roomId: room.roomId,
      roomName: room.roomName,
    });
  };

  setRoomName = (roomDTO: RoomDTO) => {
    if (this.getRoomInformation(roomDTO.roomId) == undefined) {
      // throw error room does not exist
      return;
    }

    const currentRoomsUpdates = this.activeRooms.map((room) =>
      room.roomId == roomDTO.roomId
        ? {
            socket: room.socket,
            roomId: room.roomId,
            roomName: roomDTO.roomName,
          }
        : room,
    );

    this.activeRooms = currentRoomsUpdates;

    this.getRoomInformation(roomDTO.roomId).socket.emit(
      'setRoomName',
      roomDTO.roomName,
    );
  };

  removeRoom = (roomName: string) => {
    this.activeRooms = this.activeRooms.filter(
      (room) => room.roomName == roomName,
    );
  };

  //Returns undefined if room does not exist,
  // returns room object if it exists
  getRoomInformation = (roomId: string): Room =>
    this.activeRooms.find((room) => room.roomId == roomId);

  private _checkForDuplicateRoom = (roomName: string) =>
    this.activeRooms.some((room) => room.roomName == roomName);

  listRooms = (client: Socket) => {
    client.emit('availableRooms', this.activeRooms);
  };
}

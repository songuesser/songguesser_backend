import { Player } from './players';
import { UserWithOutSocket } from './user';

class Room {
  roomName: string;
  roomId: string;
  players: Player[];
  admin: UserWithOutSocket;

  constructor(roomId: string, roomName: string) {
    this.roomId = roomId;
    this.roomName = roomName;
    this.players = [];
  }
}

export { Room };

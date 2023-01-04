import { Socket } from 'socket.io';

class Room {
  roomName: string;
  roomId: string;
  socket: Socket;
  
  constructor(roomId: string, roomName: string){
    this.roomId = roomId;
    this.roomName =roomName;
  }
}


export { Room };

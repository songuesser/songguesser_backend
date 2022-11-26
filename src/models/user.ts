import { Socket } from 'socket.io';

class User {
  username: string;
  userId: string;
  socket: Socket;
}

export { User };

import { Socket } from 'socket.io';

class User {
  username: string;
  userId: string;
  socket: Socket;
}

class UserWithOutSocket {
  username: string;
  userId: string;
}

export { UserWithOutSocket };
export { User };

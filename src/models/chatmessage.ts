import { UserWithOutSocket } from './user';

class ChatMessage {
  id: string;
  player: UserWithOutSocket;
  message: string;
  time: string;
}

export { ChatMessage };

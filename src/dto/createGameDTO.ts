import { Player } from '../models/player';

class CreateGameDTO {
  players: Player[];
  roomId: string;
}

export { CreateGameDTO };
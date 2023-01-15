import { UserWithOutSocket } from './user';

class Player extends UserWithOutSocket {
  points: number;
  selectedSong: string;
  guessedSong: string;
  hasGuessed: boolean;
}

export { Player };

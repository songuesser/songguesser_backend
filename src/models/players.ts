import { UserWithOutSocket } from './user';

class Player extends UserWithOutSocket {
  points: number;
  selectedSong: string;
  guessedSong: string;
}

export { Player };

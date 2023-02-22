import { Song } from './song';
import { UserWithOutSocket } from './user';

class Player extends UserWithOutSocket {
  points: number;
  selectedSong: Song | undefined;
  guessedSong: Song | undefined;
  hasGuessed: boolean;
}

export { Player };

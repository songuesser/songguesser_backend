import { Song } from '../models/song';

class SelectSongDTO {
  userId: string;
  gameId: string;
  song: Song;
}

export { SelectSongDTO };

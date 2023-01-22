import { GAMESTATE } from './enums/game-state';
import { Player } from './player';

class Game {
  playersJoined: Player[];
  playersThatShouldJoin: Player[];
  round: number;
  state: GAMESTATE;
  chat: string[];
  gameId: string;
  name: string;
}

export { Game };

import { GAMESTATE } from './enums/game-state';
import { Player } from './player';

class Game {
  playersJoined: Player[];
  playersThatShouldJoin: Player[];
  round: 0;
  state: GAMESTATE;
  chat: string[];
  gameId: string;
  name: string;
}

export { Game };

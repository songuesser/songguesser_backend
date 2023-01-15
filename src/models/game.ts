import { GAMESTATE } from './enums/game-state';
import { Player } from './player';

class Game {
  player: Player[];
  round: 0;
  state: GAMESTATE;
  chat: string[];
}

export { Game };

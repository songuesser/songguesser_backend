import { Player } from './player';

class CountDown {
  totalTime: number;
  currentTime: number;
  message: string;
  currentlySelectedPlayer?: Player;
}

export { CountDown };

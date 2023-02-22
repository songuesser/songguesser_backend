import { ChatMessage } from './chatmessage';
import { CountDown } from './countdown';
import { EVENTS } from './enums/events';
import { Game } from './game';
import { Player } from './player';
import { Rankings } from './rankings';

class GameEvent {
  eventType: EVENTS;
  data: ChatMessage | Player | CountDown | Rankings;
  game: Game;
}

export { GameEvent };

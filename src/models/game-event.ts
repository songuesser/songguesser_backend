import { ChatMessage } from './chatmessage';
import { EVENTS } from './enums/events';
import { Game } from './game';
import { Player } from './player';

class GameEvent {
  eventType: EVENTS;
  data: ChatMessage | Player;
  game: Game;
}

export { GameEvent };

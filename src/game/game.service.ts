import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { Game } from '../models/game';
import { WEBSOCKET_CHANNELS } from '../models/enums/websocket-channels';
import { EVENTS } from '../models/enums/events';
import { Player } from '../models/player';
import { GAMESTATE } from '../models/enums/game-state';
import { CreateGameDTO } from '../dto/createGameDTO';

@Injectable()
export class GameService {
  runningGames: Game[] = [];

  runGame() {
    throw new Error('Method not implemented.');
  }

  setupGame(createGameDTO: CreateGameDTO, server: Server) {
    const game: Game = {
      player: [],
      round: 0,
      state: GAMESTATE.SELECTING,
      chat: [],
    };
    server
      .to(createGameDTO.roomId)
      .emit(WEBSOCKET_CHANNELS.CREATE_GAME, EVENTS.GAME_START);
  }
}

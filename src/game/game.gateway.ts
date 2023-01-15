import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { GameService } from './game.service';
import { WEBSOCKET_CHANNELS } from '../models/enums/websocket-channels';
import { CreateGameDTO } from '../dto/createGameDTO';

@WebSocketGateway({ cors: true })
class GameGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly gameService: GameService) {}

  @SubscribeMessage(WEBSOCKET_CHANNELS.CREATE_GAME)
  setupGame(@MessageBody() createGameDTO: CreateGameDTO) {
    this.gameService.setupGame(createGameDTO, this.server);
  }

  @SubscribeMessage(WEBSOCKET_CHANNELS.IN_GAME)
  sendGameEvents() {
    this.gameService.runGame();
  }
}

export { GameGateway };

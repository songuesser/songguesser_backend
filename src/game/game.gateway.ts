import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { GameService } from './game.service';
import { WEBSOCKET_CHANNELS } from '../models/enums/websocket-channels';
import { SendMessageDTO } from '../dto/sendMessageDTO';
import { CreateGameDTO } from '../dto/createGameDTO';
import { AssignPlayerToGameDTO } from '../dto/assignPlayerToGameDTO';
import { Song } from '../models/song';
import { Socket } from 'dgram';
import { SelectSongDTO } from '../dto/selectSongDTO';
import { Player } from 'src/models/player';
import { LeaveRoomDTO } from 'src/dto/leaveRoomDTO';

@WebSocketGateway({ cors: true })
class GameGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly gameService: GameService) {}

  @SubscribeMessage(WEBSOCKET_CHANNELS.CREATE_GAME)
  setupGame(@MessageBody() createGameDTO: CreateGameDTO) {
    this.gameService.setupGame(createGameDTO, this.server);
  }

  @SubscribeMessage(WEBSOCKET_CHANNELS.IN_GAME_CHAT)
  sendGameEvents(@MessageBody() sendMessageDTO: SendMessageDTO) {
    this.gameService.redirectMessage(sendMessageDTO, this.server);
  }

  @SubscribeMessage(WEBSOCKET_CHANNELS.IN_GAME_JOIN_PLAYER)
  sendPlayerToGame(
    @MessageBody() assignPlayerToGameDTO: AssignPlayerToGameDTO,
  ) {
    this.gameService.assignPlayerToRoom(assignPlayerToGameDTO, this.server);
  }

  @SubscribeMessage(WEBSOCKET_CHANNELS.SELECT_SONG)
  setSelectedSong(@MessageBody() selectSongDTO: SelectSongDTO) {
    this.gameService.setSelectedSongForPlayer(selectSongDTO);
  }

  @SubscribeMessage(WEBSOCKET_CHANNELS.LEAVE_ROOM)
  leaveRoom(@MessageBody() leaveRoomDTO: LeaveRoomDTO) {
    this.gameService.leaveRoom(leaveRoomDTO, this.server);
  }
}

export { GameGateway };

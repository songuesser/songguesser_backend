import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { Game } from '../models/game';
import { WEBSOCKET_CHANNELS } from '../models/enums/websocket-channels';
import { EVENTS } from '../models/enums/events';
import { Player } from '../models/player';
import { GAMESTATE } from '../models/enums/game-state';
import { CreateGameDTO } from '../dto/createGameDTO';
import { SendMessageDTO } from '../dto/sendMessageDTO';
import { ChatMessage } from '../models/chatmessage';
import { UserService } from '../user/user.service';
import { GameEvent } from '../models/game-event';
import { AssignPlayerToGameDTO } from '../dto/assignPlayerToGameDTO';
import { randomUUID } from 'crypto';

@Injectable()
export class GameService {
  runningGames: Game[] = [];

  constructor(private readonly userService: UserService) {}

  redirectMessage(sendMessageDTO: SendMessageDTO, server: Server) {
    const { roomId, message, userId } = sendMessageDTO;
    const user = this.userService.getUserInformation(userId);

    if (user == undefined) {
      return;
    }

    const game = this.findGameById(roomId);

    if (game == undefined) {
      return;
    }

    if (message == undefined || message == '') {
      return;
    }

    const chatMessage: ChatMessage = {
      id: randomUUID(),
      message: message,
      time: new Date().toDateString(),
      player: { userId: user.userId, username: user.username },
    };

    const chatMessageEvent: GameEvent = {
      eventType: EVENTS.MESSAGE,
      game: game,
      data: chatMessage,
    };

    server.to(roomId).emit(WEBSOCKET_CHANNELS.IN_GAME, chatMessageEvent);
  }

  setupGame(createGameDTO: CreateGameDTO, server: Server) {
    const { players, roomId, roomName } = createGameDTO;
    const game: Game = {
      playersThatShouldJoin: players,
      playersJoined: [],
      round: 0,
      state: GAMESTATE.SELECTING,
      chat: [],
      gameId: roomId,
      name: roomName,
    };
    this.runningGames.push(game);
    server.to(roomId).emit(WEBSOCKET_CHANNELS.CREATE_GAME, EVENTS.GAME_START);
  }

  assignPlayerToRoom(
    assignPlayerToGameDTO: AssignPlayerToGameDTO,
    server: Server,
  ) {
    const { userId, roomId } = assignPlayerToGameDTO;
    const game = this.findGameById(roomId);

    if (game == undefined) {
      return;
    }

    if (!game.playersThatShouldJoin.find((player) => player.userId == userId)) {
      return;
    }

    const joinedPlayer: Player = game.playersThatShouldJoin.find(
      (player) => player.userId == userId,
    );

    if (game.playersJoined.includes(joinedPlayer)) {
      return;
    }

    const newGame: Game = {
      ...game,
      playersJoined: [...game.playersJoined, joinedPlayer],
    };

    this.updateGame(newGame);

    const playerJoinEvent: GameEvent = {
      eventType: EVENTS.PLAYER_JOINED,
      game: newGame,
      data: joinedPlayer,
    };

    server.to(roomId).emit(WEBSOCKET_CHANNELS.IN_GAME, playerJoinEvent);
  }

  findGameById(gameId: string): Game | undefined {
    return this.runningGames.find((game) => game.gameId == gameId);
  }

  updateGame(newGame: Game) {
    const newCurrentGames = this.runningGames.map((game) =>
      game.gameId == newGame.gameId ? newGame : game,
    );

    this.runningGames = newCurrentGames;
  }
}

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
import { CountDown } from '../models/countdown';
import { Rankings } from '../models/rankings';

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

    if (newGame.playersThatShouldJoin.length == newGame.playersJoined.length) {
      this.startGame(newGame, server);
    }
  }

  private startGame(game: Game, server: Server) {
    const countdown: CountDown = {
      message: 'Game start',
      seconds: 3,
    };

    const gameStartCountDown: GameEvent = {
      eventType: EVENTS.COUNTDOWN,
      game: game,
      data: countdown,
    };

    server.to(game.gameId).emit(WEBSOCKET_CHANNELS.IN_GAME, gameStartCountDown);
    this.handleRounds(game, server);
  }

  private handleRounds(game: Game, server: Server) {
    const maxRounds = 3;
    const amountOfPlayers: number = game.playersJoined.length;
    setTimeout(() => this.setSelectTime(game, server), 3000);

    for (let j = 0; j <= maxRounds - 1; j++) {
      for (let i = 0; i <= amountOfPlayers - 1; i++) {
        setTimeout(
          () =>
            this.startGuessingTime(game.playersJoined[i], game.gameId, server),
          60000,
        );
      }

      setTimeout(
        () => this.setSelectTime(game.gameId, server),
        1000 * amountOfPlayers * 60000,
      );
    }

    setTimeout(
      () => this.endGame(game.gameId, server),
      1000 * amountOfPlayers * 60000 * maxRounds,
    );
  }

  private endGame(gameId: string, server: Server) {
    const game = this.findGameById(gameId);
    const rankings: Rankings = {
      playersOrderedByPoints: game.playersJoined.sort(
        (a, b) => a.points - b.points,
      ),
    };

    const gameEndEvent: GameEvent = {
      eventType: EVENTS.COUNTDOWN,
      game: { ...game, state: GAMESTATE.END },
      data: rankings,
    };

    server.to(game.gameId).emit(WEBSOCKET_CHANNELS.IN_GAME, gameEndEvent);
  }

  private startGuessingTime(player: Player, gameId: string, server: Server) {
    const game = this.findGameById(gameId);
    const countdown: CountDown = {
      message: `Guess ${player.username}'s song`,
      seconds: 60,
    };

    const gameStartCountDown: GameEvent = {
      eventType: EVENTS.COUNTDOWN,
      game: { ...game, state: GAMESTATE.GUESSING },
      data: countdown,
    };

    server.to(game.gameId).emit(WEBSOCKET_CHANNELS.IN_GAME, gameStartCountDown);
  }

  private setSelectTime(gameId: string, server: Server) {
    const game = this.findGameById(gameId);
    const countdown: CountDown = {
      message: 'Select a song',
      seconds: 60,
    };

    const selectTimeCountDown: GameEvent = {
      eventType: EVENTS.COUNTDOWN,
      game: { ...game, state: GAMESTATE.SELECTING },
      data: countdown,
    };

    server
      .to(game.gameId)
      .emit(WEBSOCKET_CHANNELS.IN_GAME, selectTimeCountDown);
  }

  private findGameById(gameId: string): Game | undefined {
    return this.runningGames.find((game) => game.gameId == gameId);
  }

  private updateGame(newGame: Game) {
    const newCurrentGames = this.runningGames.map((game) =>
      game.gameId == newGame.gameId ? newGame : game,
    );

    this.runningGames = newCurrentGames;
  }
}

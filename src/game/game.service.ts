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
import { SpotifyService } from '../../spotify/spotify.service';
import { Song } from '../models/song';
import { SelectSongDTO } from '../dto/selectSongDTO';

@Injectable()
export class GameService {
  runningGames: Game[] = [];
  turnTime = 30;

  constructor(
    private readonly userService: UserService,
    private readonly spotifyService: SpotifyService,
  ) {}

  redirectMessage(sendMessageDTO: SendMessageDTO, server: Server) {
    const { roomId, message, userId, userIdOfPersonThatSelectedSong } =
      sendMessageDTO;
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

    if (userIdOfPersonThatSelectedSong == '') {
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
      return;
    }

    const correct =
      this.checkForCorrectAnswer(
        roomId,
        message,
        userId,
        userIdOfPersonThatSelectedSong,
      ) ?? false;

    if (correct) {
      const chatMessage: ChatMessage = {
        id: randomUUID(),
        message: `Server: ${user.username} has guessed correctly`,
        time: new Date().toDateString(),
        player: { userId: user.userId, username: user.username },
      };

      const chatMessageEvent: GameEvent = {
        eventType: EVENTS.MESSAGE,
        game: game,
        data: chatMessage,
      };

      server.to(roomId).emit(WEBSOCKET_CHANNELS.IN_GAME, chatMessageEvent);
    } else {
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
  }

  checkForCorrectAnswer(
    roomId: string,
    message: string,
    userId: string,
    userIdOfPersonThatSelectedSong: string,
  ): boolean {
    const game = this.findGameById(roomId);
    const songThatPersonSet: Song = game.playersJoined.find(
      (player) => player.userId == userIdOfPersonThatSelectedSong,
    ).selectedSong;

    if (songThatPersonSet == undefined) {
      return false;
    }

    if (
      songThatPersonSet.name.toLocaleLowerCase().trim() ==
      message.toLowerCase().trim()
    ) {
      const player = game.playersJoined.find(
        (player) => player.userId == userId,
      );

      const newPlayer = { ...player, points: player.points + 100 };
      const newPlayers = game.playersJoined.map((player) =>
        player.userId == userId ? newPlayer : player,
      );
      const updatedGame = { ...game, playersJoined: newPlayers };
      this.updateGame(updatedGame);

      return true;
    } else if (
      songThatPersonSet.artist.toLocaleLowerCase().trim() ==
      message.toLowerCase().trim()
    ) {
      const player = game.playersJoined.find(
        (player) => player.userId == userId,
      );

      const newPlayer = { ...player, points: player.points + 50 };
      const newPlayers = game.playersJoined.map((player) =>
        player.userId == userId ? newPlayer : player,
      );
      const updatedGame = { ...game, playersJoined: newPlayers };
      this.updateGame(updatedGame);

      return true;
    }

    return false;
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
      totalTime: 3,
      currentTime: 3,
    };

    let counter = 4;
    const intervalId = setInterval(() => {
      counter--;
      const gameStartCountDown: GameEvent = {
        eventType: EVENTS.COUNTDOWN,
        game: game,
        data: { ...countdown, currentTime: counter },
      };

      server
        .to(game.gameId)
        .emit(WEBSOCKET_CHANNELS.IN_GAME, gameStartCountDown);

      if (counter === 0) {
        clearInterval(intervalId);
        this.handleSelectRounds(game, server);
      }
    }, 1000);
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

  private async startGuessingTime(
    player: Player,
    gameId: string,
    server: Server,
  ) {
    const game = this.findGameById(gameId);
    console.log(`Guessing time for ${player.username}'s song sent`);

    const countdown: CountDown = {
      message: `Guess ${player.username}'s song`,
      totalTime: this.turnTime,
      currentTime: this.turnTime,
      currentlySelectedPlayer: player,
    };

    let counter = this.turnTime;
    const intervalId = setInterval(() => {
      const guessTimeCountDown: GameEvent = {
        eventType: EVENTS.COUNTDOWN,
        game: { ...game, state: GAMESTATE.GUESSING },
        data: { ...countdown, currentTime: counter },
      };

      server
        .to(game.gameId)
        .emit(WEBSOCKET_CHANNELS.IN_GAME, guessTimeCountDown);
      counter--;
      if (counter === 0) {
        clearInterval(intervalId);
      }
    }, 1000);
  }

  private handleGuessingRounds(gameId: string, server: Server) {
    const game = this.findGameById(gameId);
    const players = game.playersJoined;

    for (let i = 0; i <= players.length - 1; i++) {
      if (i == 0) {
        this.startGuessingTime(players[i], game.gameId, server);
      } else {
        setTimeout(() => {
          this.startGuessingTime(players[i], game.gameId, server);
        }, this.turnTime * 1000 * i);
      }
    }
  }

  private setSelectTime(gameId: string, server: Server) {
    console.log(`Selecting time starts`);
    const game = this.findGameById(gameId);
    const countdown: CountDown = {
      message: 'Select a song',
      totalTime: this.turnTime,
      currentTime: this.turnTime,
    };

    let counter = this.turnTime;
    const intervalId = setInterval(() => {
      const selectTimeCountDown: GameEvent = {
        eventType: EVENTS.COUNTDOWN,
        game: { ...game, state: GAMESTATE.SELECTING },
        data: { ...countdown, currentTime: counter },
      };

      server
        .to(game.gameId)
        .emit(WEBSOCKET_CHANNELS.IN_GAME, selectTimeCountDown);
      counter--;
      if (counter === 0) {
        clearInterval(intervalId);
        this.handleGuessingRounds(game.gameId, server);
      }
    }, 1000);
  }

  private handleSelectRounds(game: Game, server: Server) {
    const maxRounds = 3;

    for (let i = 0; i <= maxRounds - 1; i++) {
      setTimeout(() => {
        console.log('New round starts');

        this.setSelectTime(game.gameId, server);
      }, 1000 * this.turnTime * i * (game.playersJoined.length + 1));
    }
    //Game by Only the Family
    setTimeout(() => {
      this.endGame(game.gameId, server);
    }, 1000 * this.turnTime * maxRounds * (game.playersJoined.length + 1));
  }

  setSelectedSongForPlayer(selectSongDTO: SelectSongDTO) {
    const { userId, gameId, song } = selectSongDTO;

    const game = this.findGameById(gameId);
    const player = game.playersJoined.find((player) => player.userId == userId);
    const newPlayer = {
      ...player,
      selectedSong: song,
    };
    console.log(newPlayer);
    const newPlayers = game.playersJoined.map((player) =>
      player.userId == newPlayer.userId ? newPlayer : player,
    );

    const updatedGame = { ...game, playersJoined: newPlayers };
    this.updateGame(updatedGame);
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

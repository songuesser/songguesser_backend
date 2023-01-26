import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SpotifyService } from './spotify.service';
import { WEBSOCKET_CHANNELS } from '../src/models/enums/websocket-channels';

@WebSocketGateway({ cors: true })
class SpotifyGateway {
  @WebSocketServer() server: Server;
  constructor(private readonly spotifyService: SpotifyService) {}

  @SubscribeMessage(WEBSOCKET_CHANNELS.MATCHING_SONGS)
  async getMatchingSongList(
    @ConnectedSocket() socket: Socket,
    @MessageBody() songName: string,
  ) {
    socket.emit(
      WEBSOCKET_CHANNELS.MATCHING_SONGS,
      await this.spotifyService.getMatchingSongList(songName),
    );
  }
}

export { SpotifyGateway };

import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SpotifyService } from './spotify.service';

@WebSocketGateway({ cors: true })
class SpotifyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  constructor(private readonly spotifyService: SpotifyService) { }

  async handleConnection(client: Socket) { 
    this.spotifyService.initializeSpotifyApi();
  }

  async handleDisconnect(client: Socket) {

  }

  @SubscribeMessage('playGivenSong')
  playGivenSong(@MessageBody() songName: string) {
    this.spotifyService.playGivenSong(songName);
  }

  @SubscribeMessage('getMatchingSongList')
  getMatchingSongList(@ConnectedSocket() socket: Socket, @MessageBody() songName: string) {
    this.spotifyService.getMatchingSongList(songName).then(songList => {
      socket.emit("matchingSongs",songList);
    });
  }

  @SubscribeMessage('selectedSong')
  selectedSong(@MessageBody() song: any) {
    this.spotifyService.recieveSelectedSong(song);
  }
  
}

export { SpotifyGateway };

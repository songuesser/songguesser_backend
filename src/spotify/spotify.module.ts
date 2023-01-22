import { Module } from '@nestjs/common';
import { SpotifyGateway } from './spotify.gateway';
import { SpotifyService } from './spotify.service';

@Module({
  providers: [SpotifyGateway, SpotifyService],
  exports: [SpotifyService]
})
export class SpotifyModule {}

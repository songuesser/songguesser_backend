import { Module } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { SpotifyGateway } from './spotify.gateway';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [SpotifyGateway, SpotifyService],
  exports: [SpotifyService],
})
export class SpotifyModule {}

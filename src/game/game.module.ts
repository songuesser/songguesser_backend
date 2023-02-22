import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { UserModule } from '../user/user.module';
import { SpotifyModule } from '../../spotify/spotify.module';

@Module({
  imports: [UserModule, SpotifyModule],
  providers: [GameService, GameGateway],
  exports: [GameService],
})
export class GameModule {}

import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [GameService, GameGateway],
  exports: [GameService],
})
export class GameModule {}

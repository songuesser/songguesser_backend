import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { RoomService } from './room/room.service';
import { RoomModule } from './room/room.module';
import { GameService } from './game/game.service';
import { GameModule } from './game/game.module';

@Module({
  imports: [UserModule, RoomModule, GameModule],
  controllers: [AppController],
  providers: [AppService, UserService, RoomService, GameService],
})
export class AppModule {}

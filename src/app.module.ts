import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { RoomService } from './room/room.service';
import { RoomModule } from './room/room.module';
import { GameService } from './game/game.service';
import { GameModule } from './game/game.module';
import { SpotifyModule } from '../spotify/spotify.module';
import { SpotifyService } from '../spotify/spotify.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    UserModule,
    RoomModule,
    GameModule,
    SpotifyModule,
    ConfigModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    UserService,
    RoomService,
    GameService,
    SpotifyService,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { RoomService } from './room/room.service';
import { RoomModule } from './room/room.module';
import { SpotifyService } from './spotify/spotify.service';
import { SpotifyModule } from './spotify/spotify.module';

@Module({
  imports: [UserModule,RoomModule,SpotifyModule],
  controllers: [AppController],
  providers: [AppService, UserService,RoomService,SpotifyService],
})
export class AppModule {}

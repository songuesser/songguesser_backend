import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { RoomService } from './room/room.service';
import { RoomModule } from './room/room.module';

@Module({
  imports: [UserModule,RoomModule],
  controllers: [AppController],
  providers: [AppService, UserService,RoomService],
})
export class AppModule {}

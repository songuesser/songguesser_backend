import { Module } from '@nestjs/common';
import { UserGateway } from './user.gateway';
import { UserService } from './user.service';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [RoomModule],
  providers: [UserGateway, UserService],
  exports: [UserService],
})
export class UserModule {}

import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { RoomGateway } from './room.gateway';
import { RoomService } from './room.service';

@Module({
  providers: [RoomGateway, RoomService],
  exports: [RoomService],
  imports: [UserModule],
})
export class RoomModule {}

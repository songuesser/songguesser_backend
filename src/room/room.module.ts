import { Module, forwardRef } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { RoomGateway } from './room.gateway';
import { RoomService } from './room.service';

@Module({
  imports: [forwardRef(() => UserModule)],
  providers: [RoomGateway, RoomService],
  exports: [RoomService],
})
export class RoomModule {}

import { Module } from '@nestjs/common';
import { UserGateway } from './user.gateway';
import { UserService } from './user.service';

@Module({
  providers: [UserGateway, UserService],
})
export class UserModule {}

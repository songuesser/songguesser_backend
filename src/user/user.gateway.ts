import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UserService } from './user.service';

@WebSocketGateway({ cors: true })
class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly userService: UserService) {}

  @SubscribeMessage('userJoin')
  async handleConnection(client: Socket, @MessageBody() userName: string) {
    console.log(client.id);
    console.log(userName);
  }

  @SubscribeMessage('userLeave')
  async handleDisconnect(client: Socket) {
    console.log(client.id);
  }
}

export { UserGateway };

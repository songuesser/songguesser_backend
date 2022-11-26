import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { randomUUID } from 'crypto';
import { Server, Socket } from 'socket.io';
import { UserDTO } from 'src/dto/userDTO';
import { UserService } from './user.service';

@WebSocketGateway({ cors: true })
class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  constructor(private readonly userService: UserService) {}

  async handleConnection(client: Socket) {
    this.userService.createUser(client, {
      userId: client.id,
      username: randomUUID().toString(),
    });
  }

  async handleDisconnect(client: Socket) {
    // Check if connection has an established user
    const user = this.userService.getUserInformation(client.id);

    if (user == undefined) {
      return;
    }

    this.userService.removeUser(user.username);
  }

  @SubscribeMessage('setUsername')
  setUserName(@MessageBody() userDTO: UserDTO) {
    this.userService.setUserName(userDTO);
  }
}

export { UserGateway };

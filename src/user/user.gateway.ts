import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { randomUUID } from 'crypto';
import { Server, Socket } from 'socket.io';
import { CreateUserDTO } from 'src/dto/createUserDTO';
import { UserDTO } from 'src/dto/userDTO';
import { WEBSOCKET_CHANNELS } from 'src/models/enums/websocket-channels';
import { UserService } from './user.service';

@WebSocketGateway({ cors: true })
class UserGateway implements OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  constructor(private readonly userService: UserService) {}

  async handleDisconnect(client: Socket) {
    // Check if connection has an established user
    const user = this.userService.getUserInformation(client.id);

    if (user == undefined) {
      return;
    }

    this.userService.removeUser(user.username);
  }

  @SubscribeMessage(WEBSOCKET_CHANNELS.CREATE_ACCOUNT)
  createNewUser(
    @ConnectedSocket() socket: Socket,
    @MessageBody() createUserDTO: CreateUserDTO,
  ) {
    this.userService.createUser(socket, createUserDTO);
  }

  @SubscribeMessage(WEBSOCKET_CHANNELS.SET_USERNAME)
  setUserName(@MessageBody() userDTO: UserDTO) {
    this.userService.setUserName(userDTO);
  }
}

export { UserGateway };

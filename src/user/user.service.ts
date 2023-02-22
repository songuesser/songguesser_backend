import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Socket } from 'socket.io';
import { CreateUserDTO } from 'src/dto/createUserDTO';
import { UserDTO } from 'src/dto/userDTO';
import { WEBSOCKET_CHANNELS } from 'src/models/enums/websocket-channels';
import { User } from 'src/models/user';
import { RoomService } from '../room/room.service';

@Injectable()
export class UserService {
  activeUsers: User[] = [];

  constructor(
    @Inject(forwardRef(() => RoomService))
    private readonly roomService: RoomService,
  ) {}

  createUser = (socket: Socket, createUserDTO: CreateUserDTO) => {
    const userUID = socket.id;
    const user: User = {
      userId: userUID,
      username: createUserDTO.username,
      socket: socket,
    };

    if (this._checkForDuplicateUser(userUID)) {
      socket.emit('Username is already used');
    }

    this.activeUsers.push(user);
    console.log(createUserDTO.username + ' was created!');

    socket.emit(WEBSOCKET_CHANNELS.CREATE_ACCOUNT, {
      userId: userUID,
      username: user.username,
    });
    this.roomService.listRooms(undefined, socket);
  };

  setUserName = (userDTO: UserDTO) => {
    if (this.getUserInformation(userDTO.userId) == undefined) {
      // throw error user does not exist
      return;
    }

    const currentUsersUpdates = this.activeUsers.map((user) =>
      user.userId == userDTO.userId
        ? {
            socket: user.socket,
            userId: user.userId,
            username: userDTO.username,
          }
        : user,
    );

    this.activeUsers = currentUsersUpdates;

    this.getUserInformation(userDTO.userId).socket.emit(
      WEBSOCKET_CHANNELS.SET_USERNAME,
      userDTO.username,
    );
  };

  removeUser = (username: string) => {
    this.activeUsers = this.activeUsers.filter(
      (user) => user.username == username,
    );
  };

  // Returns undefined if user does not exist
  getUserInformation = (userId: string): User =>
    this.activeUsers.find((user) => user.userId == userId);

  private _checkForDuplicateUser = (username: string) =>
    this.activeUsers.some((user) => user.username == username);
}

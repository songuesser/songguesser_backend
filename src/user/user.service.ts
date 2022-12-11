import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { UserDTO } from 'src/dto/userDTO';
import { User } from 'src/models/user';

@Injectable()
export class UserService {
  activeUsers: User[] = [];

  createUser = (socket: Socket, userDTO: UserDTO) => {
    const user: User = {
      userId: userDTO.userId,
      username: userDTO.username,
      socket: socket,
    };

    if (this._checkForDuplicateUser(userDTO.userId)) {
      socket.emit('Username is already used');
    }

    this.activeUsers.push(user);
    console.log(userDTO.username + ' was created!');
    socket.emit('accountCreated', {
      userId: user.userId,
      username: user.username,
    });
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
      'setUsername',
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

import { Injectable } from '@nestjs/common';
import { UserDTO } from 'src/dto/userDTO';
import { User } from 'src/models/user';

@Injectable()
export class UserService {
  activeUsers: User[] = [];

  createUser = (userDTO: UserDTO) => {
    const user: User = { userId: userDTO.userId, username: userDTO.username };

    if (this._checkForDuplicateUser(userDTO.userId)) {
      // emit error
    }

    this.activeUsers.push(user);
  };

  removeUser = (userId: string) => {
    this.activeUsers = this.activeUsers.filter((user) => user.userId == userId);
  };

  getUserInformation = (userId: string) =>
    this.activeUsers.find((user) => user.userId == userId);

  private _checkForDuplicateUser = (userId: string) =>
    this.activeUsers.some((user) => user.userId == userId);
}

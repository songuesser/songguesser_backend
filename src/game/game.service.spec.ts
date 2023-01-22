import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { UserService } from '../user/user.service';
import { RoomService } from '../room/room.service';

describe('GameService', () => {
  let service: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameService, UserService, RoomService],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

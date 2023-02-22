import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { UserService } from '../user/user.service';
import { RoomService } from '../room/room.service';
import { SpotifyService } from '../../spotify/spotify.service';
import { ConfigService } from '@nestjs/config';

describe('GameService', () => {
  let service: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: {},
        },
        GameService,
        UserService,
        RoomService,
        SpotifyService,
      ],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

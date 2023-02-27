const enum WEBSOCKET_CHANNELS {
  CREATE_ACCOUNT = 'createAccount',
  SET_USERNAME = 'setUsername',
  CREATE_ROOM = 'createRoom',
  LIST_ROOMS = 'listRooms',
  SET_ROOM_NAME = 'setRoomName',
  JOIN_ROOM = 'joinRoom',
  IN_GAME = 'inGame',
  IN_GAME_CHAT = 'inGameChat',
  IN_GAME_JOIN_PLAYER = 'inGameJoinPlayer',
  CREATE_GAME = 'createGame',
  RUNNING_GAME = 'runningGame',
  MATCHING_SONGS = 'matchingSongs',
  SELECT_SONG = 'selectSong',
  LEAVE_ROOM = 'leaveRoom'
}

export { WEBSOCKET_CHANNELS };

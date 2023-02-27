import { Injectable, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import { Song } from '../src/models/song';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SpotifyService implements OnModuleInit {
  onModuleInit() {
    this.initializeSpotifyApi();
  }
  // Member
  Spotify = require('spotify-web-api-node');
  spotifyApi = new this.Spotify();
  access_token: any;
  selected_song: Array<any> = [];

  constructor(private configService: ConfigService) {}
  /**
   * Initializes the connection to the Spotify API
   */
  async initializeSpotifyApi() {
    const clientId = this.configService.get<string>('CLIENT_ID');
    const clientSecret = this.configService.get<string>('CLIENT_SECRET');

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const data = {
      grant_type: 'client_credentials',
    };
    try {
      const response = await axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${auth}`,
        },
        data: new URLSearchParams(data),
      });
      this.access_token = response.data.access_token;
    } catch (error) {}

    this.spotifyApi.setAccessToken(this.access_token);
  }

  /**
   * This function returns a list of the first 5 (LIST_SIZE) songs matching
   * to the string of the user input
   *
   * @param songName User input of which song he wants to play
   */
  getMatchingSongList(songName: string): Promise<Song[]> {
    const LIST_SIZE = 5;
    return new Promise((resolve, reject) => {
      axios
        .get(
          'https://api.spotify.com/v1/search?q=' + songName + '&type=track',
          {
            headers: {
              Authorization: 'Bearer ' + this.access_token,
              'Content-Type': 'application/json',
            },
          },
        )
        .then((response) => {
          // Get a list of songs matching to the given string
          const songListObjects = response.data.tracks.items.slice(
            0,
            LIST_SIZE,
          );
          const songList: Song[] = [];

          songListObjects.forEach((song) => {
            songList.push({
              name: song.name,
              artist: song.artists[0].name,
              uri: song.uri,
            });
          });
          resolve(songList);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}

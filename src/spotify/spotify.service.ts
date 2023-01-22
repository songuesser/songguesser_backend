import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SpotifyService {

  // Member
  Spotify = require('spotify-web-api-node');
  spotifyApi = new this.Spotify();
  access_token: any;
  selected_song: Array<any> = [];

  /**
   * Initializes the connection to the Spotify API
   */
  async initializeSpotifyApi() {

    const clientId = 'clientID';
    const clientSecret = 'clientSecret';
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
          'Authorization': `Basic ${auth}`
        },
        data: new URLSearchParams(data)
      });
      this.access_token = response.data.access_token;
    } catch (error) {
      console.log(error);
    }

    this.spotifyApi.setAccessToken(this.access_token);
    console.log("set access token to: " +this.access_token)
  }

  /**
   * NOT WORKING: Should play the song
   * 
   * @param songName User input of which song he wants to play
   */
  playGivenSong(songName: string) {
    
    axios.get('https://api.spotify.com/v1/search?q=' + songName+ '&type=track', {
        headers: {
            'Authorization': 'Bearer ' + this.access_token,
            'Content-Type': 'application/json'
        }
    })
    .then((response) => {
        // Get the first song from the search results
        const song = response.data.tracks.items[0];
        // Play the song
        this.spotifyApi.play({ uris: [song.uri] });
        console.log("playing song: " +song.uri)
    })
    .catch((error) => {
        console.log(error);
    });
  }


  /**
   * This function returns a list of the first 5 (LIST_SIZE) songs matching
   * to the string of the user input 
   * 
   * @param songName User input of which song he wants to play
   */
   getMatchingSongList(songName: string) {
    const LIST_SIZE = 5;
    return new Promise((resolve, reject) => {
      axios
        .get(
          'https://api.spotify.com/v1/search?q=' +
            songName +
            '&type=track',
          {
            headers: {
              Authorization: 'Bearer ' + this.access_token,
              'Content-Type': 'application/json',
            },
          }
        )
        .then((response) => {
          // Get a list of songs matching to the given string
          const songListObjects = response.data.tracks.items.slice(0, LIST_SIZE);
          const songList = new Array();
  
          songListObjects.forEach((song) => {
            songList.push({
              name: song.name,
              artist:song.artists[0].name,
              uri: song.uri
            });
          });
          resolve(songList);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * Puts the selected song of the user into an array
   * 
   * @param song The selected song of the user
   */
  recieveSelectedSong(song: any) {
    
    this.selected_song.push({
      user: "TODO",
      song: song
    })
   
  }
  

  
}

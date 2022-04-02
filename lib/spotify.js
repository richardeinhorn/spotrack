var SpotifyWebApi = require("spotify-web-api-node");

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
var spotifyApi = new SpotifyWebApi({
  redirectUri: process.env.SPOTIFY_REDIRECT_URL,
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

async function refreshAccessToken() {
  spotifyApi.setRefreshToken(process.env.SPOTIFY_REFRESH_TOKEN);
  spotifyApi.refreshAccessToken().then(
    function (data) {
      console.log("✅ Spotify access token has been refreshed!");

      // Save the access token so that it's used in future calls
      spotifyApi.setAccessToken(data.body["access_token"]);
    },
    function (err) {
      console.log("❌ Could not refresh Spotify access token", err);
    }
  );
}

// Create the authorization URL
export async function getSpotifyApi() {
    await refreshAccessToken();
    return [true, spotifyApi];
}

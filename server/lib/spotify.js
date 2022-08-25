import SpotifyWebApi from "spotify-web-api-node";
import { getUsers, updateUserData } from "./supabase";

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
const spotifyApi = new SpotifyWebApi({
  redirectUri: process.env.SPOTIFY_REDIRECT_URL,
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

export async function getAuthorizationUrl() {
  const state = "6fd6b97708bd42dfbacb13950a3921d6";
  var scopes = ["user-read-private", "user-read-email"];

  return spotifyApi.createAuthorizeURL(scopes, state);
}

export async function getAuthorizationCode(code) {
  const authResponse = await spotifyApi.authorizationCodeGrant(code);
  if (!authResponse) throw new Error("failed to get auth response");
  return authResponse.body;
}

export async function addSpotifyRefreshTokenToUser(auth) {
  const { access_token, refresh_token } = auth;

  // get spotify user
  const tempSpotifyApi = new SpotifyWebApi({
    redirectUri: process.env.SPOTIFY_REDIRECT_URL,
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  });
  tempSpotifyApi.setAccessToken(access_token);
  const spotifyUser = await tempSpotifyApi.getMe();
  const userEmail = spotifyUser.body.email;

  // get supabase UUID for spotify user
  const users = await getUsers();
  const userUid = users.find((user) => user.email === userEmail).id;
  if (!userUid) throw new Error("Could not find user in database");

  // add refresh token to supabase user record
  const user = await updateUserData(userUid, { refresh_token, access_token });
  console.info(
    `added refresh_token ${refresh_token.substring(0, 9)}... to user ${userUid}`
  );
  return user;
}

export async function getCurrentTrackFromUser(
  spotifyApi,
  calendarId,
  userUid,
  refreshToken,
  accessToken,
  processData
) {
  // set access token for current user
  spotifyApi.setAccessToken(accessToken);

  // fetch current track
  spotifyApi.getMyCurrentPlayingTrack().then(
    function (data) {
      // on success, process data
      processData(calendarId, userUid, data);
    },
    async function (err) {
      // on error, try to refresh token
      console.error("❌ Cron job failed on 1st attempt. " + err);
      const newAccessToken = await refreshAccessToken(refreshToken, userUid);
      if (!newAccessToken) return;

      spotifyApi.setAccessToken(newAccessToken);

      // then request current playing track again
      spotifyApi.getMyCurrentPlayingTrack().then(
        async function (data) {
          // on success, process data
          processData(calendarId, userUid, data);

          // update user record with new access token
          await updateUserData(userUid, { access_token: newAccessToken });
          console.info("Updated access token for user " + userUid);
        },
        function (err) {
          return console.error(
            "❌ Cron job failed on 2nd attempt. No data processed." + JSON.stringify(err)
          );
        }
      );
    }
  );
}

export async function refreshAccessToken(refresh_token, userUid) {
  spotifyApi.setRefreshToken(refresh_token);
  return spotifyApi.refreshAccessToken().then(
    function (data) {
      const newAccessToken = data.body["access_token"];
      if (!newAccessToken)
        throw new Error(
          `No access token returned from Spotify for user ${userUid}`
        );

      console.info(`✅ Spotify access token refreshed for user: ${userUid}.`);
      return newAccessToken;
    },
    function (err) {
      console.error(
        `❌ Could not refresh Spotify access token for user: ${userUid}. Error: ${err}`
      );
    }
  );
}

// Create Spotify API
export async function getSpotifyApi() {
  return [true, spotifyApi];
}

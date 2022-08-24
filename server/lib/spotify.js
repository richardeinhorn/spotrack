import SpotifyWebApi from "spotify-web-api-node";
import { supabase } from "./supabase";

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
const spotifyApi = new SpotifyWebApi({
  redirectUri: process.env.SPOTIFY_REDIRECT_URL,
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

export async function getAuthorizationUrl() {
  const state = "6fd6b97708bd42dfbacb13950a3921d6"
  var scopes = ['user-read-private', 'user-read-email'];

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
  const { data: users, error: listUserError } = await supabase.auth.api.listUsers()
  if (listUserError) throw new Error(listUserError);
  const userUid = users.find(user => user.email === userEmail).id;
  if (!userUid) throw new Error("Could not find user in database");

  // add refresh token to supabase user record
  const { data: user, error: updateUserError } = await supabase.auth.api.updateUserById(
    userUid,
    { user_metadata: { refresh_token, access_token } }
  )
  if (updateUserError) throw new Error(updateUserError);
  
  console.info(`added refresh_token ${refresh_token.substring(0, 9)}... to user ${userUid}`)

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
          const { error: updateUserError } =
            await supabase.auth.api.updateUserById(userUid, {
              user_metadata: { access_token: newAccessToken },
            });
          if (updateUserError)
            console.error(
              "Error saving new access token to User record." + updateUserError
            );
          else console.info("Updated access token for user " + userUid);
        },
        function (err) {
          return console.error(
            "❌ Cron job failed on 2nd attempt. No data processed." + err
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
      const newAccessToken = data.body["access_token"]
      if (!newAccessToken) throw new Error(`No access token returned from Spotify for user ${userUid}`);
      
      console.info(`✅ Spotify access token refreshed for user: ${userUid}.`);
      return newAccessToken;
    },
    function (err) {
      console.error(`❌ Could not refresh Spotify access token for user: ${userUid}. Error: ${err}`);
    }
  );
}

// Create Spotify API
export async function getSpotifyApi() {
    return [true, spotifyApi];
}

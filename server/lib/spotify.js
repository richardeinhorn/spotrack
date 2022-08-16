const SpotifyWebApi = require("spotify-web-api-node");
const { supabase } = require("./supabase");

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
const spotifyApi = new SpotifyWebApi({
  redirectUri: process.env.SPOTIFY_REDIRECT_URL,
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

export async function getAuthorizationUrl() {
  // const state = require('crypto').randomBytes(8, function(err, buffer) {
  //   return buffer.toString('hex');
  // })
  const state = "6fd6b97708bd42dfbacb13950a3921d6"
  var scopes = ['user-read-private', 'user-read-email'];

  return spotifyApi.createAuthorizeURL(scopes, state);
}

export async function getAuthorizationCode(code) {
  const authResponse = await spotifyApi.authorizationCodeGrant(code);
  if (!authResponse) throw new Error("failed to get auth response");
  return authResponse.body;
}

export async function getUsers() {
  const { data: users, error } = await supabase.auth.api.listUsers()
  if (error) throw new Error(error);
  return users
}

export async function addSpotifyRefreshTokenToUser(auth) {
  const { access_token, refresh_token } = auth;

  // get spotify user
  spotifyApi.setAccessToken(access_token);
  const spotifyUser = await spotifyApi.getMe();
  const userEmail = spotifyUser.body.email;

  // get supabase UUID for spotify user
  const { data: users, listUserError } = await supabase.auth.api.listUsers()
  if (listUserError) throw new Error(listUserError);
  const userUid = users.find(user => user.email === userEmail).id;
  if (!userUid) throw new Error("Could not find user in database");

  // add refresh token to supabase user record
  const { data: user, updateUserError } = await supabase.auth.api.updateUserById(
    userUid,
    { user_metadata: { refresh_token } }
  )
  if (updateUserError) throw new Error(updateUserError);
  
  console.info(`added refresh_token ${refresh_token.substring(0, 9)}... to user ${userUid}`)

  return user;
}

export async function refreshAccessToken(refresh_token) {
  spotifyApi.setRefreshToken(refresh_token);
  spotifyApi.refreshAccessToken().then(
    function (data) {
      console.info("✅ Spotify access token has been refreshed!");

      // Save the access token so that it's used in future calls
      spotifyApi.setAccessToken(data.body["access_token"]);
    },
    function (err) {
      console.error("❌ Could not refresh Spotify access token", err);
    }
  );
}

// Create the authorization URL
export async function getSpotifyApi(refresh_token = process.env.SPOTIFY_REFRESH_TOKEN) {
    await refreshAccessToken(refresh_token);
    return [true, spotifyApi];
}
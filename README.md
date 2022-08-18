<p align="center">
<img width="300" src="src/assets/spotrack-logo-wordmark--light.svg#gh-light-mode-only">
<img width="300" src="src/assets/spotrack-logo-wordmark--dark.svg#gh-dark-mode-only">
</p>

---

# Spotrack

[Spotrack](https://spotrack.herokuapp.com/) records your Spotify listening to your Google calendar. Travel through time and discover what songs you listened to at every moment.

- [x] Support for [Google Calendar](https://calendar.google.com/) (no other calendars supported at the moment)
- [x] Capture listening from all your devices
- [x] Secure [OAuth 2.0](https://oauth.net/2/) authentication to connect to your Spotify account

## Setup

Start tracking in minutes - sign up for Spotrack here:

[Spotrack Sign-Up](https://spotrack.herokuapp.com/signup)

If you would like to self-host this integration:

Copy the repository:

```console
git clone [REPOSITORY]
```

You will need to set up a Spotify developer account and a Google Cloud Platform account to track songs and interact with the calendar.

In addition, you will need to setup a database to store user data and listening history.

## Development

If you would like to contribute, please reach out to me or create a pull request for your suggested changes.

To run this project locally:

```console
git clone [REPOSITORY]
```

Install dependencies:

```console
cd ./spotrack
yarn install
yarn dev && cd server/ && yarn dev
```

## Roadmap

- [ ] Support for additional calendars
- [ ] Add dashboard with listening statistics
- [ ] Move all data into relational DB

## FAQs

*Are podcasts supported?*\
Unfortunately, Spotify does not make podcast information available to integrations. Spotrack will still show periods when you listened to podcasts, however, no detailed information can be shown.

## Acknowledgments

This project is inspired by [Spotify Wrapped](https://spotify.com/wrapped) and a similar feature available in the [Amie](https://www.amie.so/) calendar.

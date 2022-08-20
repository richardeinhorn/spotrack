import http from "http";

export function keepDynoAlive() {
  const url = process.env.APP_URL;
  if (url) http.get(url.replace('https://', 'http://')); // only support http calls
}

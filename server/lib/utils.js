import http from "http";

export function keepDynoAlive() {
  http.get(process.env.APP_URL);
}

import http from "http";

export function keepDynoAlive() {
  const API_URL = `http://localhost:${process.env.PORT}/`;
  http.get(API_URL);
}

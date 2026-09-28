import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "");

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
});
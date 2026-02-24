import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  withCredentials: true, // REQUIRED for HTTP-only cookie auth
  autoConnect: false, // Prevent unwanted early connection
});

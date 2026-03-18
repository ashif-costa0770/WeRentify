import { io } from "socket.io-client";

// Get the Socket.io server URL from environment variable
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL;

// Throw error if the environment variable is not defined
if (!SOCKET_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

/**
 * Export a pre-configured socket.io client instance.
 * - withCredentials: Allows HTTP-only cookie (auth) to be sent
 * - autoConnect: false means socket will not connect until .connect() is called
 * - transports: ["websocket"] forces using WebSocket only
 */
export const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
  transports: ["websocket"],
});

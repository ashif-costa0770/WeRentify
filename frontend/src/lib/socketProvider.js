"use client";

import { useEffect } from "react";
import { socket } from "@/lib/socket";

export default function SocketProvider({ children }) {
  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Socket connected ✅", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected ❌");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, []);

  return children;
}
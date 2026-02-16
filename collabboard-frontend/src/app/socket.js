import { io } from "socket.io-client";
import { useSocketStore } from "../store/socket.store";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
const getToken = () => localStorage.getItem("token") || sessionStorage.getItem("token") || "";

export const socket = io(baseUrl, {
  auth: {
    token: getToken()
  },
  autoConnect: true,
  transports: ["websocket"]
});

socket.on("connect", () => useSocketStore.getState().setConnected(true));
socket.on("disconnect", () => useSocketStore.getState().setConnected(false));

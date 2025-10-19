import { io } from "socket.io-client";

const ENDPOINT = import.meta.env.VITE_API_BASE_URL;

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(user) {
    if (!this.socket) {
      this.socket = io(ENDPOINT, {
        withCredentials: true,
      });

      this.socket.on("connect", () => {
        console.log("✅ Connected to server");
        this.isConnected = true;
        if (user) {
          this.socket.emit("setup", user);
        }
      });

      this.socket.on("disconnect", () => {
        console.log("❌ Disconnected from server");
        this.isConnected = false;
      });

      this.socket.on("connected", () => {
        console.log("✅ User setup complete");
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getSocket() {
    return this.socket;
  }

  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }
}

const socketService = new SocketService();
export default socketService;

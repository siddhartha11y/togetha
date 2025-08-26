import { io } from "socket.io-client";

const ENDPOINT = "http://localhost:5000"; // your backend
const socket = io(ENDPOINT);

export default socket;

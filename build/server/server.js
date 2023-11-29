"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketServer = exports.socket = exports.expressServer = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
exports.app = (0, express_1.default)();
exports.expressServer = (0, http_1.createServer)(exports.app);
const io = new socket_io_1.Server(exports.expressServer, {
    cors: {
        origin: "*",
    },
});
let socketEvent;
exports.socket = io;
function SocketServer() {
    io.on("connection", (socket) => {
        console.log("A device has connected check it ======== ", socket.id);
    });
    return socketEvent;
}
exports.SocketServer = SocketServer;

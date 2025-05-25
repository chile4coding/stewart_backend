"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_client_1 = __importDefault(require("./configuration/prisma-client"));
const server_1 = require("./server/server");
// import requestHeaders from "./middleware/requestHeader";
const body_parser_1 = __importDefault(require("body-parser"));
const morgan_1 = __importDefault(require("morgan"));
// import errorHandler from "errorhandler";
const errorhandler_1 = __importDefault(require("./middleware/errorhandler"));
const cors_1 = __importDefault(require("cors"));
const route_1 = __importDefault(require("./route/route"));
const server_2 = require("./server/server");
dotenv_1.default.config();
server_1.app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    optionsSuccessStatus: 200,
}));
server_1.app.use(body_parser_1.default.json());
server_1.app.use(body_parser_1.default.urlencoded({ extended: false }));
server_1.app.use((0, morgan_1.default)("dev"));
// app.use(cors({ credentials: true, origin: "*" }));
// app.use(requestHeaders)
server_1.app.use(route_1.default);
server_1.app.use(errorhandler_1.default);
class CreateDBConnect {
    constructor() {
        this.db = prisma_client_1.default;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // requiredEnvVars.forEach((envVar) => {
                //   if (!process.env[envVar]) {
                //     throw new Error(`Missing ${ezzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzznvVar} environment variable`);
                //   }
                // });
                yield this.db.$connect();
                console.log("Connected to database successfully");
                (0, server_2.SocketServer)();
                const server = server_2.expressServer.listen(process.env.port || 8080, () => console.log(`Server started on port ${process.env.port}`));
            }
            catch (error) {
                console.error("Failed to connect to database", error.message);
            }
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.$disconnect();
        });
    }
}
const dbConnect = new CreateDBConnect();
dbConnect.connect();

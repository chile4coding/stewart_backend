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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_client_1 = __importDefault(require("./configuration/prisma-client"));
const errorhandler_1 = __importDefault(require("./middleware/errorhandler"));
const requestHeader_1 = __importDefault(require("./middleware/requestHeader"));
const body_parser_1 = __importDefault(require("body-parser"));
const cloudinary_1 = require("cloudinary");
const cors_1 = __importDefault(require("cors"));
const route_1 = __importDefault(require("./route/route"));
dotenv_1.default.config();
const app = (0, express_1.default)();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)({ credentials: true, origin: "*" }));
app.use(requestHeader_1.default);
app.use(errorhandler_1.default);
app.use(route_1.default);
class CreateDBConnect {
    constructor() {
        this.db = prisma_client_1.default;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // requiredEnvVars.forEach((envVar) => {
                //   if (!process.env[envVar]) {
                //     throw new Error(`Missing ${envVar} environment variable`);
                //   }
                // });
                yield this.db.$connect();
                console.log("Connected to database successfully");
                const server = app.listen(process.env.port, () => console.log(`Server started on port ${process.env.port}`));
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

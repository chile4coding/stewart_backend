import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import prisma from "./configuration/prisma-client";
import errorHandler from "./middleware/errorhandler";
// import requestHeaders from "./middleware/requestHeader";
import bodyParser from  "body-parser"
import { v2 as cloudinary } from "cloudinary";


import cors from "cors"
import router from "./route/route";

dotenv.config();

const app = express();


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cors({
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    origin: "*",
  })
);
// app.use(cors({ credentials: true, origin: "*" }));

// app.use(requestHeaders)
app.use(errorHandler)
app.use(router)

class CreateDBConnect {
  db: PrismaClient;
  constructor() {
    this.db = prisma;
  }
  async connect() {
    try {
      // requiredEnvVars.forEach((envVar) => {
      //   if (!process.env[envVar]) {
      //     throw new Error(`Missing ${envVar} environment variable`);
      //   }
      // });
      await this.db.$connect();
      console.log("Connected to database successfully");
      const server = app.listen(process.env.port, () =>
        console.log(`Server started on port ${process.env.port}`)
      );
    } catch (error: any) {
      console.error("Failed to connect to database", error.message);
    }
  }
  async disconnect() {
    await this.db.$disconnect();
  }
}
const dbConnect = new CreateDBConnect();
dbConnect.connect();

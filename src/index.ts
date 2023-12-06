import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import prisma from "./configuration/prisma-client";
import { app } from "./server/server";
// import requestHeaders from "./middleware/requestHeader";
import bodyParser from "body-parser";
import { v2 as cloudinary } from "cloudinary";
import morgan from "morgan";
// import errorHandler from "errorhandler";
import errorHandler from "./middleware/errorhandler";
import cors from "cors";
import router from "./route/route";
import { SocketServer, expressServer } from "./server/server";

dotenv.config();

app.use(
  cors({
    origin: "*",
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(morgan("dev"));

// app.use(cors({ credentials: true, origin: "*" }));

// app.use(requestHeaders)

app.use(router);
app.use(errorHandler);

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
      SocketServer();
      const server = expressServer.listen(process.env.port, () =>
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

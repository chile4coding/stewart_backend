import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import prisma from "./configuration/prisma-client";
dotenv.config();

const app = express();

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

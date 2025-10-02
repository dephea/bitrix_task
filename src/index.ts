import dotenv from "dotenv";
dotenv.config();

import express from "express";

import taskRouter from "./api/tasks.ts"

const app = express();

const PORT = process.env.PORT || 3000;
export const BITRIX_WEBHOOK_URL = process.env.BITRIX_WEBHOOK_URL as string;


app.use(express.json());

app.use("/tasks", taskRouter);


app.listen(PORT, () => {
    console.log("Server is running on port" + PORT);
})
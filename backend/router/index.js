import { Router } from "express";
import usersRouter from "./user.js";

const router = Router();

router.use("/user", usersRouter);

export default router;

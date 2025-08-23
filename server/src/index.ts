import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { corsOptions } from "./constants/cors.constant";
import { env } from "./env";
import { errorMiddleware } from "./middlewares/error.middleware";
import { connectDb } from "./db/conenct.db";

const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());
app.use(cors(corsOptions));

//ROUTES
import { superAdminRouter } from "./routes/super-admin.route";

app.use("/api/v1/super-admin", superAdminRouter);

//ERROR MIDDLEWARE
app.use(errorMiddleware);

connectDb(env.MONGO_URI)
  .then(() => {
    app.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT}`);
    });
  })
  .catch((err) => console.log(err));

import { CorsOptions } from "cors";
import { env } from "../env";

const corsOptions: CorsOptions = {
  origin: [env.CLIENT_URL, "https://localhost:5173"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};

export { corsOptions };

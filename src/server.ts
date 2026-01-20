import { Server } from "http";

import app from "./app";

import mongoose from "mongoose";
import config from "./app/config";

const port = config.port;

async function main() {
  await mongoose.connect(config.database_url as string);
  console.log("db connnection established");

  const server: Server = app.listen(port, () => {
    console.log(`Server is listening on port http://localhost:${port}`);
  });
}

main();

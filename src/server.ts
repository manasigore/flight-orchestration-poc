import { buildApp } from "./app.ts";

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: 3001 });
    app.log.info(`Server listening on port 3001`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();

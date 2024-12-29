import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { helmet } from "elysia-helmet";
import appConfig from "./shared/common/config";
import { AppError, responseErr } from "./shared/utils/error";

function buildApp() {
  const app = new Elysia({ aot: false, prefix: appConfig.app.prefixApiUrl });

  app.use(cors({ origin: appConfig.app.corsWhiteList }));
  app.use(helmet());

  // app error handling
  app.error({ AppError }).onError((ctx) => {
    return responseErr(ctx.error, ctx);
  });

  return app;
}

export default buildApp();

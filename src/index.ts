import app from './app';
import mongodbService from './shared/common/mongodb';
import setupMiddlewares from './shared/middleware';
import { setupUserModule } from './modules/user';
import appConfig from './shared/common/config';

async function bootServer(port: number) {
  // Connect mongodb
  await mongodbService.connect();

  const sctx = {
    mdlFactory: setupMiddlewares(),
  };
  // create module
  const userModule = setupUserModule(sctx);
  // setupModule
  app.use(userModule);

  // important, required listen(port) to run app
  app.listen(port);
  console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
}

bootServer(appConfig.app.port ? +appConfig.app.port : 3000);

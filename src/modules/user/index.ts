import { ServiceContext } from "~/shared/interface";
import { MongodbUserRepository } from "./service/mongodb";
import { UserService } from "./service/service";
import { HttpUserController } from "./controller";

export function setupUserModule(sctx: ServiceContext) {
  const repository = new MongodbUserRepository();

  const service = new UserService(repository);

  const controller = new HttpUserController(service);

  return controller.getRoutes(sctx.mdlFactory);
}

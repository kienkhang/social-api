import { OauthRepositoryService } from './service/oauth';
import { OauthService } from './service/service';
import { HttpOauthController } from './controller';

export function setupOauthModule() {
  const repository = new OauthRepositoryService();

  const service = new OauthService(repository);

  const controller = new HttpOauthController(service);

  return controller.getRoutes();
}

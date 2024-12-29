import appConfig from "~/shared/common/config";
import { createHash } from "node:crypto";

function sha256(content: string) {
  return createHash("sha3-256").update(content).digest("hex");
}

function hashPassword(password: string) {
  return sha256(`${password}${appConfig.app.hashPasswordKey}`);
}

export { sha256, hashPassword };

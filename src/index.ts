import { buildApp } from "./infrastructure/http/app";
import { env } from "./shared/config/env";

const app = buildApp();

app.listen(env.APP_PORT, () => {
  console.log(`Guitar Flow backend running on port ${env.APP_PORT}`);
});

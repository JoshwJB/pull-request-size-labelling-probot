import AdapterGithubActions from "@probot/adapter-github-actions";
import app from "./app";

AdapterGithubActions.run(app).catch((error) => {
  console.error(error);
  process.exit(1);
});

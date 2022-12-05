import { updatePullRequestWithFileSizeLabel } from "./features/PullRequestFileSize";
import { Probot } from "probot";

export = (app: Probot) => {
  app.on("pull_request.opened", async (context) => {
    await updatePullRequestWithFileSizeLabel(context);
  });

  app.on("pull_request.reopened", async (context) => {
    await updatePullRequestWithFileSizeLabel(context);
  });

  app.on("pull_request.synchronize", async (context) => {
    await updatePullRequestWithFileSizeLabel(context);
  });
};

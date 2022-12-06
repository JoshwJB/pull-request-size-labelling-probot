import { updatePullRequestWithFileSizeLabel } from "./features/PullRequestFileSize";
import { Context, Probot } from "probot";
import { updatePullRequestWithLinesChangedLabel } from "./features/PullRequestLinesChanged";

export = (app: Probot) => {
  app.on("pull_request.opened", async (context) => {
    await updatePullRequest(context);
  });

  app.on("pull_request.reopened", async (context) => {
    await updatePullRequest(context);
  });

  app.on("pull_request.synchronize", async (context) => {
    await updatePullRequest(context);
  });
};


async function updatePullRequest(context: Context<"pull_request">): Promise<void> {
  await Promise.all([
    updatePullRequestWithLinesChangedLabel(context),
    updatePullRequestWithFileSizeLabel(context)
  ]);
}
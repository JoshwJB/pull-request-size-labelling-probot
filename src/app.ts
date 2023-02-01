import {updatePullRequestWithFileSizeLabel} from "./features/PullRequestFileSize";
import {Context, Probot} from "probot";
import {updatePullRequestWithLinesChangedLabel} from "./features/PullRequestLinesChanged";
import getConfig from "./shared/Config";
import {setupLabels} from "./features/SetupLabels";
import getFilesChanged, {PullRequestFile} from "./shared/GetFilesChanged";

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
  const config = await getConfig(context);

  let changedFiles: PullRequestFile[] | false = false;
  if (config.features.omitted.length !== 0) {
    changedFiles = await getFilesChanged(context, config.features.omitted);
  }

  const features: Promise<void>[] = [setupLabels(context, config)];

  if (config.features.files)
    features.push(updatePullRequestWithFileSizeLabel(context, config, changedFiles));
  if (config.features.lines)
    features.push(updatePullRequestWithLinesChangedLabel(context, config, changedFiles));

  await Promise.all(features);
}

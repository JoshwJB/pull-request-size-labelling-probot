import { Context } from "probot";
import { getConfig } from "../shared/Config";

export const updatePullRequestWithFileSizeLabel = async (
  context: Context<"pull_request">
) => {
  const filesChanged = context.payload.pull_request.changed_files;
  const label = await getFilesChangedLabel(filesChanged, context);

  await Promise.all([
    removeLabelsFromPullRequest(context, label),
    addLabelsToPullRequest(context, label)
  ]);
};

const addLabelsToPullRequest = async (context: Context<"pull_request">, label: string) => {
  await context.octokit.issues.addLabels({
    labels: [label],
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
    issue_number: context.payload.number,
  });
};

const removeLabelsFromPullRequest = async (
  context: Context<"pull_request">, 
  label: string
) => {
  const existingLabels = await context.octokit.issues.listLabelsOnIssue({
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
    issue_number: context.payload.number,
  });

  const removeLabelRequests: Promise<unknown>[] = [];
  existingLabels.data
    .filter(
      (existingLabel) =>
        existingLabel.name.startsWith("files/") &&
        existingLabel.name !== label
    )
    .forEach((label) => {
      removeLabelRequests.push(
        context.octokit.issues.removeLabel({
          owner: context.payload.repository.owner.login,
          repo: context.payload.repository.name,
          issue_number: context.payload.number,
          name: label.name,
        })
      );
    });

  await Promise.all(removeLabelRequests);
};

async function getFilesChangedLabel(filesChanged: number, context: Context<"pull_request">): Promise<string> {
  const config = await getConfig(context);
  
  if (filesChanged > config.files.xxl) return "files/XXL";
  if (filesChanged > config.files.xl) return "files/XL";
  if (filesChanged > config.files.l) return "files/L";
  if (filesChanged > config.files.m) return "files/M";
  if (filesChanged > config.files.s) return "files/S";
  return "files/XS";
}

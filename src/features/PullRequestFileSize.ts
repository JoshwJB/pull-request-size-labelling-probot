import { Context } from "probot";
import { getConfig } from "../shared/Config";

export const updatePullRequestWithFileSizeLabel = async (
  context: Context<"pull_request">
) => {
  const filesChanged = context.payload.pull_request.changed_files;
  const label = await getFilesChangedLabel(filesChanged, context);

  await Promise.all([
    removeLabelsFromPullRequest(context, label),
    addLabelsToPullRequest(context, label),
  ]);
};

const addLabelsToPullRequest = async (
  context: Context<"pull_request">,
  label: string
) => {
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
        existingLabel.name.startsWith("files/") && existingLabel.name !== label
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

async function getFilesChangedLabel(
  filesChanged: number,
  context: Context<"pull_request">
): Promise<string> {
  const { files } = await getConfig(context);

  if (filesChanged > files.sizing.xxl) return `${files.prefix}XXL`;
  if (filesChanged > files.sizing.xl) return `${files.prefix}XL`;
  if (filesChanged > files.sizing.l) return `${files.prefix}L`;
  if (filesChanged > files.sizing.m) return `${files.prefix}M`;
  if (filesChanged > files.sizing.s) return `${files.prefix}S`;
  return `${files.prefix}XS`;
}

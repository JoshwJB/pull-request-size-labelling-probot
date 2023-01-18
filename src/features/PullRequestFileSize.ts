import {Context} from "probot";
import {getConfig, LabelSizeConfig} from "../shared/Config";

export const updatePullRequestWithFileSizeLabel = async (context: Context<"pull_request">) => {
  const {files} = await getConfig(context);
  const filesChanged = context.payload.pull_request.changed_files;
  const label = getFilesChangedLabel(filesChanged, files);

  await Promise.all([removeLabelsFromPullRequest(context, label, files), addLabelsToPullRequest(context, label)]);
};

const addLabelsToPullRequest = async (context: Context<"pull_request">, label: string) => {
  console.log(`Adding label: ${label}`);
  await context.octokit.issues.addLabels({
    labels: [label],
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
    issue_number: context.payload.number,
  });
};

const removeLabelsFromPullRequest = async (
  context: Context<"pull_request">,
  label: string,
  filesConfig: LabelSizeConfig
) => {
  const existingLabels = await context.octokit.issues.listLabelsOnIssue({
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
    issue_number: context.payload.number,
  });

  const removeLabelRequests: Promise<unknown>[] = [];
  existingLabels.data
    .filter((existingLabel) => existingLabel.name.startsWith(filesConfig.prefix) && existingLabel.name !== label)
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

function getFilesChangedLabel(filesChanged: number, filesConfig: LabelSizeConfig): string {
  if (filesChanged > filesConfig.sizing.xxl) return `${filesConfig.prefix}XXL`;
  if (filesChanged > filesConfig.sizing.xl) return `${filesConfig.prefix}XL`;
  if (filesChanged > filesConfig.sizing.l) return `${filesConfig.prefix}L`;
  if (filesChanged > filesConfig.sizing.m) return `${filesConfig.prefix}M`;
  if (filesChanged > filesConfig.sizing.s) return `${filesConfig.prefix}S`;
  return `${filesConfig.prefix}XS`;
}

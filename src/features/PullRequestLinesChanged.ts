import { Context } from "probot";
import { getConfig, LabelSizeConfig } from "../shared/Config";

export const updatePullRequestWithLinesChangedLabel = async (
  context: Context<"pull_request">
) => {
  const linesChanged = getLinesChanged(context);
  const { lines } = await getConfig(context);
  const label = await getLinesChangedLabel(linesChanged, lines);

  await Promise.all([
    removeLabelsFromPullRequest(context, label, lines),
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
  label: string,
  linesConfig: LabelSizeConfig
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
        existingLabel.name.startsWith(linesConfig.prefix) && existingLabel.name !== label
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

function getLinesChanged(context: Context<"pull_request">): number {
  return (
    context.payload.pull_request.additions +
    context.payload.pull_request.deletions
  );
}

async function getLinesChangedLabel(
  linesChanged: number,
  linesConfig: LabelSizeConfig
): Promise<string> {
  if (linesChanged > linesConfig.sizing.xxl) return `${linesConfig.prefix}XXL`;
  if (linesChanged > linesConfig.sizing.xl) return `${linesConfig.prefix}XL`;
  if (linesChanged > linesConfig.sizing.l) return `${linesConfig.prefix}L`;
  if (linesChanged > linesConfig.sizing.m) return `${linesConfig.prefix}M`;
  if (linesChanged > linesConfig.sizing.s) return `${linesConfig.prefix}S`;
  return `${linesConfig.prefix}XS`;
}

import { Context } from "probot";
import { getConfig } from "../shared/Config";

export const updatePullRequestWithLinesChangedLabel = async (
  context: Context<"pull_request">
) => {
  const linesChanged = getLinesChanged(context);
  const label = await getLinesChangedLabel(linesChanged, context);

  await Promise.all([
    removeLabelsFromPullRequest(context, label),
    addLabelsToPullRequest(context, label)
  ])
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
        existingLabel.name.startsWith("lines/") &&
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

function getLinesChanged(context: Context<"pull_request">): number {
  return (
    context.payload.pull_request.additions +
    context.payload.pull_request.deletions
  );
}

async function getLinesChangedLabel(linesChanged: number, context: Context<"pull_request">): Promise<string> {
  const {lines} = await getConfig(context);

  if (linesChanged > lines.xxl) return "lines/XXL";
  if (linesChanged > lines.xl) return "lines/XL";
  if (linesChanged > lines.l) return "lines/L";
  if (linesChanged > lines.m) return "lines/M";
  if (linesChanged > lines.s) return "lines/S";
  return "lines/XS";
}

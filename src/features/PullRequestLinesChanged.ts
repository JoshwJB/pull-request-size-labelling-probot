import { Context } from "probot";

export const updatePullRequestWithLinesChangedLabel = async (
  context: Context<"pull_request">
) => {
  await removeLabelsFromPullRequest(context);
  await addLabelsToPullRequest(context);
};

const addLabelsToPullRequest = async (context: Context<"pull_request">) => {
  const linesChanged = getLinesChanged(context);
  console.log("linesChanged", linesChanged);
  await context.octokit.issues.addLabels({
    labels: [getLinesChangedLabel(linesChanged)],
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
    issue_number: context.payload.number,
  });
};

const removeLabelsFromPullRequest = async (
  context: Context<"pull_request">
) => {
  const linesChanged = getLinesChanged(context);
  const labels = await context.octokit.issues.listLabelsOnIssue({
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
    issue_number: context.payload.number,
  });

  const removeLabelRequests: Promise<unknown>[] = [];
  labels.data
    .filter(
      (label) =>
        label.name.startsWith("lines/") &&
        label.name !== getLinesChangedLabel(linesChanged)
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

const getLinesChangedLabel = (linesChanged: number): string => {
  if (linesChanged > 100) return "lines/XXL";
  if (linesChanged > 50) return "lines/XL";
  if (linesChanged > 25) return "lines/L";
  if (linesChanged > 10) return "lines/M";
  if (linesChanged > 5) return "lines/S";
  return "lines/XS";
};

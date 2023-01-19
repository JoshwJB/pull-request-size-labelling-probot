import {Context} from "probot";

export default async function addLabelsToPullRequest(
  context: Context<"pull_request">,
  labels: string[]
): Promise<void> {
  console.log(`Adding labels: ${JSON.stringify(labels)}`);

  await context.octokit.issues.addLabels({
    labels,
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
    issue_number: context.payload.number,
  });
}

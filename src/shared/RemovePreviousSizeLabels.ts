import {Context} from "probot";
import {LabelSizeConfig} from "./Config";

export default async function removePreviousSizeLabels(
  context: Context<"pull_request">,
  label: string,
  config: LabelSizeConfig
): Promise<void> {
  const existingLabels = await context.octokit.issues.listLabelsOnIssue({
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
    issue_number: context.payload.number,
  });

  const removeLabelRequests: Promise<unknown>[] = [];
  existingLabels.data
    .filter(
      (existingLabel) =>
        existingLabel.name.toLowerCase().startsWith(config.prefix.toLowerCase()) &&
        existingLabel.name.toLowerCase() !== label.toLowerCase()
    )
    .forEach((label) => {
      console.log("Removing label:", label);
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
}

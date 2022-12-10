import { LabelSizeConfig, LabelSuffix } from "./../shared/Config";
import { Context } from "probot";
import { getConfig } from "../shared/Config";

export async function setupLabels(
  context: Context<"pull_request">
): Promise<void> {
  const { lines, files } = await getConfig(context);

  await Promise.all([
    createLabels(lines, context),
    createLabels(files, context),
  ]);
}

async function createLabels(
  labelSizeConfig: LabelSizeConfig,
  context: Context<"pull_request">
): Promise<void> {
  const labels = Object.values(LabelSuffix).map((suffix) => ({
    label: `${labelSizeConfig.prefix}${suffix}`,
    colour: labelSizeConfig.colours[suffix],
  }));

  const requests: Promise<unknown>[] = [];

  labels.map(({ label, colour }) => {
    requests.push(
      context.octokit.issues.updateLabel({
        name: label,
        color: colour.replace("#", ""),
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
      })
    );
  });

  await Promise.all(requests);
}

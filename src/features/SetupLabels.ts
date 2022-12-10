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
  const existingLabels = await context.octokit.issues.listLabelsForRepo({
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
  });
  const labels = Object.values(LabelSuffix).map((suffix) => ({
    name: `${labelSizeConfig.prefix}${suffix}`,
    colour: labelSizeConfig.colours[suffix],
  }));

  const requests: Promise<unknown>[] = [];

  labels.map(({ name, colour }) => {
    requests.push(
      upsertLabel(
        context,
        name,
        colour,
        !!existingLabels.data.find((label) => label.name === name)
      )
    );
  });

  await Promise.all(requests);
}

async function upsertLabel(
  context: Context<"pull_request">,
  name: string,
  colour: string,
  labelExists: boolean
): Promise<void> {
  if (labelExists) {
    await context.octokit.issues.updateLabel({
      name,
      color: colour.replace("#", ""),
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
    });
  } else {
    context.octokit.issues.createLabel({
      name,
      color: colour.replace("#", ""),
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
    });
  }
}

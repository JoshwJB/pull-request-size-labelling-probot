import {LabelSizeConfig, LabelSuffix} from "./../shared/Config";
import {Context} from "probot";
import getConfig from "../shared/Config";

export async function setupLabels(context: Context<"pull_request">): Promise<void> {
  const {lines, files} = await getConfig(context);

  await Promise.all([createLabels(lines, context), createLabels(files, context)]);
}

async function createLabels(
  labelSizeConfig: LabelSizeConfig,
  context: Context<"pull_request">
): Promise<void> {
  const labels = Object.values(LabelSuffix).map((suffix) => ({
    name: `${labelSizeConfig.prefix}${suffix}`,
    colour: labelSizeConfig.colours[suffix],
  }));

  const requests: Promise<unknown>[] = [];

  labels.map(({name, colour}) => {
    requests.push(upsertLabel(context, name, colour));
  });

  await Promise.all(requests);
}

async function upsertLabel(
  context: Context<"pull_request">,
  name: string,
  colour: string
): Promise<void> {
  try {
    await context.octokit.issues.createLabel({
      name,
      color: colour.replace("#", ""),
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
    });
  } catch (error) {
    console.info(`Label [${name}] already exists, updating instead.`);
    await context.octokit.issues.updateLabel({
      name,
      color: colour.replace("#", ""),
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
    });
  }
}

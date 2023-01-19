import {Context} from "probot";
import addLabelsToPullRequest from "../shared/AddLabelsToPullRequest";
import {Config, LabelSizeConfig} from "../shared/Config";
import getFilesChanged from "../shared/GetFilesChanged";
import removePreviousSizeLabels from "../shared/RemovePreviousSizeLabels";

export const updatePullRequestWithLinesChangedLabel = async (
  context: Context<"pull_request">,
  {lines, features}: Config
) => {
  const linesChanged = await getLinesChanged(context, features.omitted);
  const label = await getLinesChangedLabel(linesChanged, lines);

  await Promise.all([
    removePreviousSizeLabels(context, label, lines),
    addLabelsToPullRequest(context, [label]),
  ]);
};

async function getLinesChanged(
  context: Context<"pull_request">,
  omitted: string[]
): Promise<number> {
  if (omitted.length === 0) {
    return context.payload.pull_request.additions + context.payload.pull_request.deletions;
  }

  const filesChanged = await getFilesChanged(context, omitted);
  return filesChanged.map((file) => file.changes).reduce((partialSum, a) => partialSum + a, 0);
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

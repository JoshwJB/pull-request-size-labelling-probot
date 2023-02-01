import {Context} from "probot";
import addLabelsToPullRequest from "../shared/AddLabelsToPullRequest";
import {Config, LabelSizeConfig} from "../shared/Config";
import {PullRequestFile} from "../shared/GetFilesChanged";
import removePreviousSizeLabels from "../shared/RemovePreviousSizeLabels";

export const updatePullRequestWithLinesChangedLabel = async (
  context: Context<"pull_request">,
  {lines}: Config,
  changedFiles: PullRequestFile[] | false
) => {
  const linesChanged = await getLinesChanged(context, changedFiles);
  const label = await getLinesChangedLabel(linesChanged, lines);

  await Promise.all([
    removePreviousSizeLabels(context, label, lines),
    addLabelsToPullRequest(context, [label]),
  ]);
};

async function getLinesChanged(
  context: Context<"pull_request">,
  changedFiles: PullRequestFile[] | false
): Promise<number> {
  if (!changedFiles) {
    return context.payload.pull_request.additions + context.payload.pull_request.deletions;
  }

  return changedFiles.map((file) => file.changes).reduce((partialSum, a) => partialSum + a, 0);
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

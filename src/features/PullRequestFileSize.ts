import {Context} from "probot";
import addLabelsToPullRequest from "../shared/AddLabelsToPullRequest";
import {Config, LabelSizeConfig} from "../shared/Config";
import getFilesChanged from "../shared/GetFilesChanged";
import removePreviousSizeLabels from "../shared/RemovePreviousSizeLabels";

export const updatePullRequestWithFileSizeLabel = async (
  context: Context<"pull_request">,
  {files, features}: Config
) => {
  const filesChanged = await calculateFilesChanged(context, features.omitted);
  const label = getFilesChangedLabel(filesChanged, files);

  await Promise.all([
    removePreviousSizeLabels(context, label, files),
    addLabelsToPullRequest(context, [label]),
  ]);
};

function getFilesChangedLabel(filesChanged: number, filesConfig: LabelSizeConfig): string {
  if (filesChanged > filesConfig.sizing.xxl) return `${filesConfig.prefix}XXL`;
  if (filesChanged > filesConfig.sizing.xl) return `${filesConfig.prefix}XL`;
  if (filesChanged > filesConfig.sizing.l) return `${filesConfig.prefix}L`;
  if (filesChanged > filesConfig.sizing.m) return `${filesConfig.prefix}M`;
  if (filesChanged > filesConfig.sizing.s) return `${filesConfig.prefix}S`;
  return `${filesConfig.prefix}XS`;
}

async function calculateFilesChanged(
  context: Context<"pull_request">,
  omitted: string[]
): Promise<number> {
  console.log("omitted", omitted);
  if (omitted.length === 0) {
    console.log("omitted.length === 0", omitted);
    return context.payload.pull_request.changed_files;
  }

  const filesChanged = await getFilesChanged(context, omitted);
  console.log("filesChanged", filesChanged);
  return filesChanged.length;
}

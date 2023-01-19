import {Context} from "probot";
import addLabelsToPullRequest from "../shared/AddLabelsToPullRequest";
import getConfig, {LabelSizeConfig} from "../shared/Config";
import removePreviousSizeLabels from "../shared/RemovePreviousSizeLabels";

export const updatePullRequestWithFileSizeLabel = async (context: Context<"pull_request">) => {
  const {files} = await getConfig(context);
  const filesChanged = context.payload.pull_request.changed_files;
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

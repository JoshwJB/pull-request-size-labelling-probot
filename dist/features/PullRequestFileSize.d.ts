import { Context } from "probot";
import { Config } from "../shared/Config";
import { PullRequestFile } from "../shared/GetFilesChanged";
export declare const updatePullRequestWithFileSizeLabel: (context: Context<"pull_request">, { files }: Config, changedFiles: PullRequestFile[] | false) => Promise<void>;

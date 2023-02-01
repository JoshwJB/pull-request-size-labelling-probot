import { Context } from "probot";
import { Config } from "../shared/Config";
import { PullRequestFile } from "../shared/GetFilesChanged";
export declare const updatePullRequestWithLinesChangedLabel: (context: Context<"pull_request">, { lines }: Config, changedFiles: PullRequestFile[] | false) => Promise<void>;

import { Context } from "probot";
import { Config } from "../shared/Config";
export declare const updatePullRequestWithFileSizeLabel: (context: Context<"pull_request">, { files, features }: Config) => Promise<void>;

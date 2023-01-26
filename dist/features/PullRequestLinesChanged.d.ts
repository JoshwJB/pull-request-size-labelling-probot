import { Context } from "probot";
import { Config } from "../shared/Config";
export declare const updatePullRequestWithLinesChangedLabel: (context: Context<"pull_request">, { lines, features }: Config) => Promise<void>;

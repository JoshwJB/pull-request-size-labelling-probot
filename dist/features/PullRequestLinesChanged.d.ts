import { Context } from "probot";
import { Config } from "../shared/Config";
export declare const updatePullRequestWithLinesChangedLabel: (context: Context<"pull_request">, { lines }: Config) => Promise<void>;

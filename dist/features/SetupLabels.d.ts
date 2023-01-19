import { Context } from "probot";
import { Config } from "../shared/Config";
export declare function setupLabels(context: Context<"pull_request">, { lines, files }: Config): Promise<void>;

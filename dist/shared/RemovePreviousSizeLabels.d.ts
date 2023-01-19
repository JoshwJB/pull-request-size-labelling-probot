import { Context } from "probot";
import { LabelSizeConfig } from "./Config";
export default function removePreviousSizeLabels(context: Context<"pull_request">, label: string, config: LabelSizeConfig): Promise<void>;

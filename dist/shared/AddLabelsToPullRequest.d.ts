import { Context } from "probot";
export default function addLabelsToPullRequest(context: Context<"pull_request">, labels: string[]): Promise<void>;

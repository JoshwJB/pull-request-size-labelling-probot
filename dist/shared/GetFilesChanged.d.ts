import { Context } from "probot";
export type PullRequestFile = {
    sha: string;
    filename: string;
    status: "added" | "removed" | "modified" | "renamed" | "copied" | "changed" | "unchanged";
    additions: number;
    deletions: number;
    changes: number;
    blob_url: string;
    raw_url: string;
    contents_url: string;
    patch?: string;
    previous_filename?: string;
};
export default function getFilesChanged(context: Context<"pull_request">, omitted: string[]): Promise<PullRequestFile[]>;

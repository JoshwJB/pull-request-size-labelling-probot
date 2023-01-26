import {Context} from "probot";

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

export default async function getFilesChanged(
  context: Context<"pull_request">,
  omitted: string[]
): Promise<PullRequestFile[]> {
  console.log("getting files changed");
  const filesPerPage = 100;
  const maxFilesChanged = 3000; // GitHub has a limit of 3000 files before it stops tracking
  const pullRequestFiles: PullRequestFile[] = [];
  let page = 1;

  try {
    do {
      const result = await context.octokit.pulls.listFiles({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        pull_number: context.payload.number,
        per_page: filesPerPage,
        page,
      });
      pullRequestFiles.push(...result.data);
      page++;
    } while (
      pullRequestFiles.length % filesPerPage === 0 &&
      pullRequestFiles.length < maxFilesChanged
    );
  } catch (error) {
    // GitHub doesn't return whether or not there is a next page, the while should work in most cases
    // and this catch handle any cases where the total number of files changed is divisible by 100
    console.error("Failed to list PR files", error);
  }

  console.log("prefiltering", pullRequestFiles.length);
  console.log("post filtering", pullRequestFiles.filter((file) =>
  omitted
    .map((regexString) => new RegExp(regexString))
    .every((regex) => !regex.test(file.filename))).length);

  return pullRequestFiles.filter((file) =>
    omitted
      .map((regexString) => new RegExp(regexString))
      .every((regex) => !regex.test(file.filename))
  );
}


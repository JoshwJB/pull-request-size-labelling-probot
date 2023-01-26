import {PullRequestFile} from "./../../src/shared/GetFilesChanged";
import target from "../../src/shared/GetFilesChanged";
import {ISSUE_NUMBER, OWNER, REPOSITORY} from "./../utils/Constants";
import {Context} from "probot";
import {v4 as uuid} from "uuid";

const mockedListFiles = jest.fn();

const context = {
  name: "pull_request",
  id: "",
  payload: {
    repository: {
      owner: {
        login: OWNER,
      },
      name: REPOSITORY,
    },
    number: ISSUE_NUMBER,
  },
  octokit: {
    pulls: {
      listFiles: mockedListFiles,
    },
  },
} as unknown as Context<"pull_request">;
const testRegexString = ".*dist/.*";
const pullRequestFile = buildPullRequestFile();

describe("get files changed", () => {
  it("should call list files once if number of files returned is not divisible by 100", async () => {
    mockedListFiles.mockResolvedValue({data: [pullRequestFile]});

    await target(context, [testRegexString]);

    expect(mockedListFiles).toHaveBeenCalledTimes(1);
  });

  it("should return files not matching omit regex strings", async () => {
    mockedListFiles.mockResolvedValue({data: [pullRequestFile, buildPullRequestFile("dist/")]});

    const result = await target(context, [testRegexString]);

    expect(result).toEqual([pullRequestFile]);
  });

  it("should call list files until we hit the max files limit of 3000", async () => {
    const files = Array.from(Array(100).keys()).map(() => buildPullRequestFile());
    mockedListFiles.mockResolvedValue({data: files});

    await target(context, [testRegexString]);

    expect(mockedListFiles).toHaveBeenCalledTimes(30);
  });
});

function buildPullRequestFile(directory = "src/"): PullRequestFile {
  return {
    raw_url: `https://github.com/${OWNER}/${REPOSITORY}/raw/${directory}${uuid()}`,
  } as PullRequestFile;
}

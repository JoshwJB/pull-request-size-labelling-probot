import target from "../../src/shared/AddLabelsToPullRequest";
import {Context} from "probot";
import {OWNER, REPOSITORY, ISSUE_NUMBER} from "../utils/Constants";

const mockedAddLabels = jest.fn();

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
    issues: {
      addLabels: mockedAddLabels,
    },
  },
} as unknown as Context<"pull_request">;
const label = "TestLabel";

describe("add labels to pull request", () => {
  it("should call addLabels", async () => {
    await target(context, [label]);

    expect(mockedAddLabels).toHaveBeenCalledTimes(1);
    expect(mockedAddLabels).toHaveBeenCalledWith({
      labels: [label],
      owner: OWNER,
      repo: REPOSITORY,
      issue_number: ISSUE_NUMBER,
    });
  });
});

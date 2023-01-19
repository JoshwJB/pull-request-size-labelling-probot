import {DEFAULT_CONFIG} from "./../../src/shared/constants/DefaultConfig";
import target from "../../src/shared/RemovePreviousSizeLabels";
import {Context} from "probot";
import {OWNER, REPOSITORY, ISSUE_NUMBER} from "../utils/Constants";

const mockedRemoveLabel = jest.fn();
const mockedListLabelsOnIssue = jest.fn();

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
      removeLabel: mockedRemoveLabel,
      listLabelsOnIssue: mockedListLabelsOnIssue,
    },
  },
} as unknown as Context<"pull_request">;
const newLabel = `${DEFAULT_CONFIG.files.prefix}L`;

describe("remove previous size labels", () => {
  it("should not remove label if it doesn't match the prefix", async () => {
    const existingLabel = {name: "TestLabel"};
    mockedListLabelsOnIssue.mockResolvedValue({data: [existingLabel]});

    await target(context, newLabel, DEFAULT_CONFIG.files);

    expect(mockedListLabelsOnIssue).toHaveBeenCalledTimes(1);
    expect(mockedListLabelsOnIssue).toHaveBeenCalledWith({
      owner: OWNER,
      repo: REPOSITORY,
      issue_number: ISSUE_NUMBER,
    });
    expect(mockedRemoveLabel).not.toHaveBeenCalled();
  });

  it("should not remove label if new label is the same", async () => {
    const existingLabel = {name: newLabel};
    mockedListLabelsOnIssue.mockResolvedValue({data: [existingLabel]});

    await target(context, newLabel, DEFAULT_CONFIG.files);

    expect(mockedRemoveLabel).not.toHaveBeenCalled();
  });

  it("should not remove label if new label is the different from old size label", async () => {
    const existingLabel = {name: `${DEFAULT_CONFIG.files.prefix}XXL`};
    mockedListLabelsOnIssue.mockResolvedValue({data: [existingLabel]});

    await target(context, newLabel, DEFAULT_CONFIG.files);

    expect(mockedRemoveLabel).toHaveBeenCalledTimes(1);
    expect(mockedRemoveLabel).toHaveBeenCalledWith({
      owner: OWNER,
      repo: REPOSITORY,
      issue_number: ISSUE_NUMBER,
      name: existingLabel.name,
    });
  });
});

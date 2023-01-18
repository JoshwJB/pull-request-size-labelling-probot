import * as target from "../../src/features/PullRequestFileSize";
import { Context } from "probot";
import { DEFAULT_CONFIG } from "../../src/shared/DefaultConfig";

let listLabelsOnIssueMock: jest.Mock;
let removeLabelMock: jest.Mock;
let addLabelsMock: jest.Mock;
let configMock: jest.Mock;

const repo = "TestRepo";
const owner = "JoshwJB";
const issueNumber = 1;
const filesLabelPrefix = DEFAULT_CONFIG.files.prefix;

describe("pull request file size", () => {
  beforeEach(() => {
    listLabelsOnIssueMock = jest.fn();
    removeLabelMock = jest.fn();
    addLabelsMock = jest.fn();
    configMock = jest.fn();
    configMock.mockResolvedValue(DEFAULT_CONFIG);
  });

  [
    {expectedLabel: "XXL", changedFiles: 100},
    {expectedLabel: "XXL", changedFiles: 61},
    {expectedLabel: "XL", changedFiles: 60},
    {expectedLabel: "XL", changedFiles: 41},
    {expectedLabel: "L", changedFiles: 40},
    {expectedLabel: "L", changedFiles: 26},
    {expectedLabel: "M", changedFiles: 25},
    {expectedLabel: "M", changedFiles: 11},
    {expectedLabel: "S", changedFiles: 10},
    {expectedLabel: "S", changedFiles: 6},
    {expectedLabel: "XS", changedFiles: 5},
    {expectedLabel: "XS", changedFiles: 1},
  ].forEach(({expectedLabel, changedFiles}) => {
    it(`should add label ${filesLabelPrefix}${expectedLabel} when changed files is ${changedFiles}`, async () => {
      listLabelsOnIssueMock.mockResolvedValue({data: []});
      const context = buildPullRequestContext(changedFiles);
  
      await target.updatePullRequestWithFileSizeLabel(context);
    
      expect(addLabelsMock).toHaveBeenCalledTimes(1);
      expect(addLabelsMock).toHaveBeenCalledWith({
        labels: [`${filesLabelPrefix}${expectedLabel}`],
        owner: "JoshwJB",
        repo: "TestRepo",
        issue_number: 1
      });
    });
  });
  
  it("should delete existing files label if label has changed", async () => {
    const existingLabel = {name: `${filesLabelPrefix}XXL`};
    listLabelsOnIssueMock.mockResolvedValue({data: [existingLabel]});
    const context = buildPullRequestContext(1);

    await target.updatePullRequestWithFileSizeLabel(context);

    expect(removeLabelMock).toHaveBeenCalledTimes(1);
    expect(removeLabelMock).toHaveBeenCalledWith({
      name: existingLabel.name,
      owner: "JoshwJB",
      repo: "TestRepo",
      issue_number: 1
    });
  });

  it("should not delete existing files label if label is the same", async () => {
    const existingLabel = {name: `${filesLabelPrefix}XS`};
    listLabelsOnIssueMock.mockResolvedValue({data: [existingLabel]});
    const context = buildPullRequestContext(1);

    await target.updatePullRequestWithFileSizeLabel(context);

    expect(removeLabelMock).not.toHaveBeenCalled();
  });
  
  it("should not delete label if it doesn't have the files label prefix", async () => {
    const existingLabel = {name: `enhancement`};
    listLabelsOnIssueMock.mockResolvedValue({data: [existingLabel]});
    const context = buildPullRequestContext(1);

    await target.updatePullRequestWithFileSizeLabel(context);

    expect(removeLabelMock).not.toHaveBeenCalled();
  });

  it("should not remove labels if none exist", async () => {
    listLabelsOnIssueMock.mockResolvedValue({data: []});
    const context = buildPullRequestContext(1);

    await target.updatePullRequestWithFileSizeLabel(context);

    expect(removeLabelMock).not.toHaveBeenCalled();
  });
});

function buildPullRequestContext(
  changedFiles = 100
): Context<"pull_request"> {
  return {
    name: "pull_request",
    id: "",
    payload: {
      pull_request: {
        changed_files: changedFiles,
      },
      repository: {
        owner: {
          login: owner
        },
        name: repo
      },
      number: issueNumber
    },
    octokit: {
      issues: {
        listLabelsOnIssue: listLabelsOnIssueMock,
        removeLabel: removeLabelMock,
        addLabels: addLabelsMock
      }
    },
    config: configMock
  } as unknown as Context<"pull_request">;
}

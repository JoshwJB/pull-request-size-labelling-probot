import * as target from "../../src/features/PullRequestLinesChanged";
import {Context} from "probot";
import {DEFAULT_CONFIG} from "../../src/shared/DefaultConfig";

let listLabelsOnIssueMock: jest.Mock;
let removeLabelMock: jest.Mock;
let addLabelsMock: jest.Mock;
let configMock: jest.Mock;

const repo = "TestRepo";
const owner = "JoshwJB";
const issueNumber = 1;
const linesLabelPrefix = DEFAULT_CONFIG.lines.prefix;

describe("pull request file size", () => {
  beforeEach(() => {
    listLabelsOnIssueMock = jest.fn();
    removeLabelMock = jest.fn();
    addLabelsMock = jest.fn();
    configMock = jest.fn();
    configMock.mockResolvedValue(DEFAULT_CONFIG);
  });

  [
    {expectedLabel: "XXL", additions: 1000, deletions: 1000},
    {expectedLabel: "XXL", additions: 501, deletions: 500},
    {expectedLabel: "XL", additions: 500, deletions: 500},
    {expectedLabel: "XL", additions: 251, deletions: 250},
    {expectedLabel: "L", additions: 250, deletions: 250},
    {expectedLabel: "L", additions: 126, deletions: 125},
    {expectedLabel: "M", additions: 125, deletions: 125},
    {expectedLabel: "M", additions: 51, deletions: 50},
    {expectedLabel: "S", additions: 50, deletions: 50},
    {expectedLabel: "S", additions: 11, deletions: 10},
    {expectedLabel: "XS", additions: 10, deletions: 10},
    {expectedLabel: "XS", additions: 1, deletions: 1},
  ].forEach(({expectedLabel, additions, deletions}) => {
    it(`should add label ${linesLabelPrefix}${expectedLabel} when changed lines is ${
      additions + deletions
    }`, async () => {
      listLabelsOnIssueMock.mockResolvedValue({data: []});
      const context = buildPullRequestContext(additions, deletions);

      await target.updatePullRequestWithLinesChangedLabel(context);

      expect(addLabelsMock).toHaveBeenCalledTimes(1);
      expect(addLabelsMock).toHaveBeenCalledWith({
        labels: [`${linesLabelPrefix}${expectedLabel}`],
        owner: "JoshwJB",
        repo: "TestRepo",
        issue_number: 1,
      });
    });
  });

  it("should delete existing lines label if label has changed", async () => {
    const existingLabel = {name: `${linesLabelPrefix}XXL`};
    listLabelsOnIssueMock.mockResolvedValue({data: [existingLabel]});
    const context = buildPullRequestContext(1);

    await target.updatePullRequestWithLinesChangedLabel(context);

    expect(removeLabelMock).toHaveBeenCalledTimes(1);
    expect(removeLabelMock).toHaveBeenCalledWith({
      name: existingLabel.name,
      owner: "JoshwJB",
      repo: "TestRepo",
      issue_number: 1,
    });
  });

  it("should not delete existing lines label if label is the same", async () => {
    const existingLabel = {name: `${linesLabelPrefix}XS`};
    listLabelsOnIssueMock.mockResolvedValue({data: [existingLabel]});
    const context = buildPullRequestContext(1, 1);

    await target.updatePullRequestWithLinesChangedLabel(context);

    expect(removeLabelMock).not.toHaveBeenCalled();
  });

  it("should not delete label if it doesn't have the files label prefix", async () => {
    const existingLabel = {name: `enhancement`};
    listLabelsOnIssueMock.mockResolvedValue({data: [existingLabel]});
    const context = buildPullRequestContext(1);

    await target.updatePullRequestWithLinesChangedLabel(context);

    expect(removeLabelMock).not.toHaveBeenCalled();
  });

  it("should not remove labels if none exist", async () => {
    listLabelsOnIssueMock.mockResolvedValue({data: []});
    const context = buildPullRequestContext(1);

    await target.updatePullRequestWithLinesChangedLabel(context);

    expect(removeLabelMock).not.toHaveBeenCalled();
  });
});

function buildPullRequestContext(additions = 100, deletions = 100): Context<"pull_request"> {
  return {
    name: "pull_request",
    id: "",
    payload: {
      pull_request: {
        additions,
        deletions,
      },
      repository: {
        owner: {
          login: owner,
        },
        name: repo,
      },
      number: issueNumber,
    },
    octokit: {
      issues: {
        listLabelsOnIssue: listLabelsOnIssueMock,
        removeLabel: removeLabelMock,
        addLabels: addLabelsMock,
      },
    },
    config: configMock,
  } as unknown as Context<"pull_request">;
}

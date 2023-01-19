import * as target from "../../src/features/PullRequestLinesChanged";
import {Context} from "probot";
import {DEFAULT_CONFIG} from "../../src/shared/constants/DefaultConfig";
import removePreviousSizeLabels from "../../src/shared/RemovePreviousSizeLabels";
import addLabelsToPullRequest from "../../src/shared/AddLabelsToPullRequest";
import {LINES_LABEL_PREFIX} from "../utils/Constants";
import getFilesChanged from "../../src/shared/GetFilesChanged";

jest.mock("../../src/shared/RemovePreviousSizeLabels");
jest.mock("../../src/shared/AddLabelsToPullRequest");
jest.mock("../../src/shared/GetFilesChanged");

const mockedRemovePreviousSizeLabels = jest.mocked(removePreviousSizeLabels);
const mockedAddLabelsToPullRequest = jest.mocked(addLabelsToPullRequest);
const mockedGetFilesChanged = jest.mocked(getFilesChanged);

describe("pull request file size", () => {
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
    it(`should add label ${LINES_LABEL_PREFIX}${expectedLabel} when changed lines is ${
      additions + deletions
    }`, async () => {
      const context = buildPullRequestContext(additions, deletions);

      await target.updatePullRequestWithLinesChangedLabel(context, DEFAULT_CONFIG);

      expect(mockedAddLabelsToPullRequest).toHaveBeenCalledTimes(1);
      expect(mockedAddLabelsToPullRequest).toHaveBeenCalledWith(context, [
        `${LINES_LABEL_PREFIX}${expectedLabel}`,
      ]);
    });
  });

  it("should call removePreviousSizeLabels", async () => {
    const context = buildPullRequestContext(1, 1);

    await target.updatePullRequestWithLinesChangedLabel(context, DEFAULT_CONFIG);

    expect(mockedRemovePreviousSizeLabels).toHaveBeenCalledTimes(1);
    expect(mockedRemovePreviousSizeLabels).toHaveBeenCalledWith(
      context,
      `${LINES_LABEL_PREFIX}XS`,
      DEFAULT_CONFIG.lines
    );
  });

  it("should call getFilesChanged when omitted exists", async () => {
    mockedGetFilesChanged.mockResolvedValue([]);
    const context = buildPullRequestContext(1, 1);
    const config = Object.assign(DEFAULT_CONFIG, {features: {omitted: ["Test"]}});

    await target.updatePullRequestWithLinesChangedLabel(context, config);

    expect(mockedGetFilesChanged).toHaveBeenCalledTimes(1);
    expect(mockedGetFilesChanged).toHaveBeenCalledWith(context, config.features.omitted);
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
    },
  } as unknown as Context<"pull_request">;
}

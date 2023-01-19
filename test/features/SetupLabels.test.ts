import {DEFAULT_CONFIG} from "./../../src/shared/constants/DefaultConfig";
import * as target from "../../src/features/SetupLabels";
import {Context} from "probot";
import {OWNER, REPOSITORY, ISSUE_NUMBER} from "../utils/Constants";
import {LabelSuffix} from "../../src/shared/Config";

const mockedCreateLabel = jest.fn();
const mockedUpdateLabel = jest.fn();

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
      createLabel: mockedCreateLabel,
      updateLabel: mockedUpdateLabel,
    },
  },
} as unknown as Context<"pull_request">;
const filesLabels = Object.values(LabelSuffix).map((suffix) => ({
  name: `${DEFAULT_CONFIG.files.prefix}${suffix}`,
  colour: DEFAULT_CONFIG.files.colours[suffix],
}));
const linesLabels = Object.values(LabelSuffix).map((suffix) => ({
  name: `${DEFAULT_CONFIG.lines.prefix}${suffix}`,
  colour: DEFAULT_CONFIG.lines.colours[suffix],
}));
const allLabels = [...filesLabels, ...linesLabels];

describe("setup labels", () => {
  it("should create labels if none exist", async () => {
    await target.setupLabels(context, DEFAULT_CONFIG);

    expect(mockedCreateLabel).toHaveBeenCalledTimes(12);
    allLabels.forEach(({name, colour}) =>
      expect(mockedCreateLabel).toHaveBeenCalledWith({
        name,
        color: colour.replace("#", ""),
        owner: OWNER,
        repo: REPOSITORY,
      })
    );
  });

  it("should update labels if they already exist", async () => {
    mockedCreateLabel.mockRejectedValue("Already exists");

    await target.setupLabels(context, DEFAULT_CONFIG);

    expect(mockedUpdateLabel).toHaveBeenCalledTimes(12);
    allLabels.forEach(({name, colour}) =>
      expect(mockedUpdateLabel).toHaveBeenCalledWith({
        name,
        color: colour.replace("#", ""),
        owner: OWNER,
        repo: REPOSITORY,
      })
    );
  });
});

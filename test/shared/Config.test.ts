import {DEFAULT_CONFIG} from "./../../src/shared/constants/DefaultConfig";
import {Context} from "probot";
import target from "../../src/shared/Config";

const mockedConfig = jest.fn();

const context = {
  config: mockedConfig,
} as unknown as Context<"pull_request">;

describe("get config", () => {
  it("should return config", async () => {
    mockedConfig.mockResolvedValue(DEFAULT_CONFIG);

    const result = await target(context);

    expect(mockedConfig).toHaveBeenCalledTimes(1);
    expect(mockedConfig).toHaveBeenCalledWith("pullRequestSizing.yml", DEFAULT_CONFIG);
    expect(result).toEqual(DEFAULT_CONFIG);
  });
});

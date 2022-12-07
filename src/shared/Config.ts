import { Context } from "probot";

export interface Config {
  labels: Labels;
  lines: Sizing;
  files: Sizing;
}

interface Labels {
  lines: boolean;
  files: boolean;
}

interface Sizing {
  xxl: number;
  xl: number;
  l: number;
  m: number;
  s: number;
}

const defaultLinesSizing: Sizing = {
  xxl: 1000,
  xl: 500,
  l: 250,
  m: 100,
  s: 20,
};

const defaultFilesSizing: Sizing = {
  xxl: 60,
  xl: 40,
  l: 25,
  m: 10,
  s: 5,
};

const defaultConfig: Config = {
  labels: {
    lines: true,
    files: true,
  },
  lines: defaultLinesSizing,
  files: defaultFilesSizing,
};

export async function getConfig(
  context: Context<"pull_request">
): Promise<Config> {
  return (await context.config(
    "pullRequestSizing.yml",
    defaultConfig
  )) as Config;
}

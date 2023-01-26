import type {Config} from "../Config";

export const DEFAULT_CONFIG: Config = {
  features: {
    lines: true,
    files: true,
    omitted: [],
  },
  lines: {
    sizing: {
      xxl: 1000,
      xl: 500,
      l: 250,
      m: 100,
      s: 20,
    },
    colours: {
      xxl: "#25066C",
      xl: "#3709A1",
      l: "#4A0CD6",
      m: "#8B5CF6",
      s: "#C2A9FA",
      xs: "#DED0FC",
    },
    prefix: "lines/",
  },
  files: {
    sizing: {
      xxl: 60,
      xl: 40,
      l: 25,
      m: 10,
      s: 5,
    },
    colours: {
      xxl: "#542E03",
      xl: "#854E05",
      l: "#E79609",
      m: "#F8C345",
      s: "#FADB76",
      xs: "#FBE58E",
    },
    prefix: "files/",
  },
};

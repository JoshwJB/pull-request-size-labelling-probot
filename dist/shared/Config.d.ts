import { Context } from "probot";
export interface Config {
    features: Features;
    lines: LabelSizeConfig;
    files: LabelSizeConfig;
}
interface Features {
    lines: boolean;
    files: boolean;
    omitted: string[];
}
export interface LabelSizeConfig {
    sizing: Sizes;
    colours: SizeColours;
    prefix: string;
}
export declare enum LabelSuffix {
    XXL = "xxl",
    XL = "xl",
    L = "l",
    M = "m",
    S = "s",
    XS = "xs"
}
type Sizes = {
    [key in Exclude<LabelSuffix, "xs">]: number;
};
type SizeColours = {
    [key in LabelSuffix]: string;
};
export default function getConfig(context: Context<"pull_request">): Promise<Config>;
export {};

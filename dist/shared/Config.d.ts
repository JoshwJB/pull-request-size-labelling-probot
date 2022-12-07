import { Context } from 'probot';
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
export declare function getConfig(context: Context<"pull_request">): Promise<Config>;
export {};

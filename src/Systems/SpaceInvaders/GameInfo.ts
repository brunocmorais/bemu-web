export class GameInfo {
    name! : string;
    files!: string[];
    addr!: number[];
}

export const map : GameInfo[] = [
    {
        name: "ballbomb",
        files: ["tn01", "tn02", "tn03", "tn04", "tn05-1"],
        addr: [0x0000, 0x0800, 0x1000, 0x1800, 0x4000]
    },
    {
        name: "invaders",
        files: ["invaders.h", "invaders.g", "invaders.f", "invaders.e"],
        addr: [0x0000, 0x0800, 0x1000, 0x1800],
    },
    {
        name: "lrescue",
        files: ["lrescue.1", "lrescue.2", "lrescue.3", "lrescue.4", "lrescue.5", "lrescue.6"],
        addr: [0x0000, 0x0800, 0x1000, 0x1800, 0x4000, 0x4800],
    },
    {
        name: "invadpt2",
        files: ["pv01", "pv02", "pv03", "pv04", "pv05"],
        addr: [0x0000, 0x0800, 0x1000, 0x1800, 0x4000],
    },
    {
        name: "ozmawars",
        files: ["mw01", "mw02", "mw03", "mw04", "mw05", "mw06"],
        addr: [0x0000, 0x0800, 0x1000, 0x1800, 0x4000, 0x4800],
    },
    {
        name: "spclaser",
        files: ["la01", "la02", "la03", "la04"],
        addr: [0x0000, 0x0800, 0x1000, 0x1800],
    },
    {
        name: "steelwkr",
        files: ["1.36", "2.35", "3.34", "4.33", "5.32", "6.31", "7.42", "8.41"],
        addr: [0x0000, 0x0400, 0x0800, 0x0c00, 0x1000, 0x1400, 0x1800, 0x1c00],
    },
];
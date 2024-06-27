import { MMU } from "../MMU";
import { IPaletteData } from "./IPaletteData";

export class MonochromePaletteData implements IPaletteData { 

    private readonly mmu : MMU;

    constructor(mmu : MMU) {
        this.mmu = mmu;
    }

    public get bgp() { return this.mmu.io[0x47]; }
    public get obp0() { return this.mmu.io[0x48]; }
    public get obp1() { return this.mmu.io[0x49]; }
}

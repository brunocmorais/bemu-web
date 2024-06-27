import { State } from "../State";
import { MMU } from "../MMU";
import { GPUMode } from "./GPUMode";
import { InterruptType } from "../InterruptType";
import { LCDC } from "./LCDC";
import { STAT } from "./STAT";

export class LCD {

    private readonly mmu : MMU;
    private readonly state : State;

    constructor(mmu : MMU, state : State) {
        this.mmu = mmu;
        this.state = state;
    }

    public get lcdc() { return this.mmu.io[0x40]; }
    public set lcdc(value : number) { this.mmu.io[0x40] = value; }

    public get stat() { return this.mmu.io[0x41]; }
    public set stat(value: number) { this.mmu.io[0x41] = value; }

    public get scy() { return this.mmu.io[0x42]; }
    public set scy(value: number) { this.mmu.io[0x42] = value; }

    public get scx() { return this.mmu.io[0x43]; }
    public set scx(value: number) { this.mmu.io[0x43] = value; }

    public get ly() { return this.mmu.io[0x44]; }
    public set ly(value: number)  { 
        this.mmu.io[0x44] = value; 
        this.setLCYRegisterCoincidence();
    }

    public get lyc() { return this.mmu.io[0x45]; }
    public set lyc(value: number) { this.mmu.io[0x45] = value; }

    public get wy() { return this.mmu.io[0x4A]; }
    public set wy(value: number) { this.mmu.io[0x4A] = value; }

    public get wx() { return this.mmu.io[0x4B]; }
    public set wx(value: number) { this.mmu.io[0x4B] = value; }

    public getLcdcFlag(option : LCDC) {
        return (this.lcdc & option) === option;
    }

    public getStatFlag(option : STAT) {
        return (this.stat & option) === option;
    }

    public get mode() { return (this.stat & 0x3) as GPUMode; }
    public set mode(value : number) { this.stat = ((this.stat & 0xFC) | value) & 0xFF; }

    public setLCYRegisterCoincidence() {

        if (this.ly === this.lyc) {
            this.stat |= 0x4;

            if (this.getStatFlag(STAT.lyCoincidenceInterrupt))
                this.state.requestInterrupt(InterruptType.lcdStat);
        }
        else
            this.stat &= 0xFB;
    }
}


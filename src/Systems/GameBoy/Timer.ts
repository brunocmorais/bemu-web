import { InterruptType } from "./InterruptType";
import { MMU } from "./MMU";
import { State } from "./State";

export class Timer {
    private cycles : number;
    private cyclesDivider : number;
    private mmu : MMU;
    private state : State;

    public constructor(mmu : MMU, state : State) {
        this.mmu = mmu;
        this.state = state;
        this.cycles = 0;
        this.cyclesDivider = 0;
    }


    public get enabled() {
        return (this.tac & 0x4) == 0x4;
    } 

    public get div() { return this.mmu.io[0x04];}
    public set div(value : number) { this.mmu.io[0x04] = value; }

    public get tima() { return this.mmu.io[0x05]; }
    public set tima(value: number) { this.mmu.io[0x05] = value; }

    public get tma() { return this.mmu.io[0x06]; }
    public set tma(value: number) { this.mmu.io[0x06] = value; }

    public get tac() { return this.mmu.io[0x07]; }
    public set tac(value: number) { this.mmu.io[0x07] = value; }

    public get step() {

        switch (this.tac & 0x3) {
            case 0:  return 1024;
            case 1:  return 16;
            case 2:  return 64;
            case 3:  return 256;
            default: throw new Error("Invalid step!");
        }
    }

    public updateTimers(lastCycleCount : number) {
        this.cyclesDivider += lastCycleCount;

        if (this.cyclesDivider >= 256) {
            this.div++;
            this.cyclesDivider -= 256;
        }

        if (this.enabled) {
            this.cycles += lastCycleCount;

            while (this.cycles >= this.step) {
                if (this.tima === 0xFF) {
                    this.state.requestInterrupt(InterruptType.timer);
                    this.tima = this.tma;
                } else
                    this.tima++;

                this.cycles -= this.step;
            }
        }
    }
}
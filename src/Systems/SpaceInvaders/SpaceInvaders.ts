import { ISystem } from "../../Core/System/ISystem";
import { CPU } from "./CPU";
import { height, width } from "./Constants";
import { MMU } from "./MMU";
import { PPU } from "./PPU";
import { State } from "./State";

export class SpaceInvaders implements ISystem {
    
    private readonly mmu : MMU;
    private readonly cpu: CPU;
    private readonly ppu: PPU;
    private readonly state: State;

    constructor(rom : Uint8Array) {
        this.state = new State();
        this.mmu = new MMU(0x10000, this.state);
        this.cpu = new CPU(this.mmu, 4194304, this.state);
        this.ppu = new PPU(this.mmu);
        this.mmu.loadProgram(rom, 0);
    }
    
    public update(keys: string[]) {

        if (this.state.halted)
            return;

        this.state.draw = false;
        let cyclesToRun = Math.floor(this.cpu.freq / 60);
        const halfCycles = Math.floor(cyclesToRun / 2);
        let lastInterrupt = this.cpu.generateInterrupt(2);
        this.state.updateKeys(keys);

        while (!this.state.halted && cyclesToRun >= 0) {

            const opcode = this.cpu.stepCycle();
            cyclesToRun -= opcode.cyclesTaken;

            if (lastInterrupt === 2 && cyclesToRun <= halfCycles)
                lastInterrupt = this.cpu.generateInterrupt(1);
        }

        if (this.state.draw)
            this.ppu.update();
    }

    
    public get framebuffer() {
        return this.ppu.framebuffer;
    }

    public pause() {
        this.state.halted = !this.state.halted;
    }

    public reset() {
        this.state.reset();
        this.ppu.framebuffer.clear();
    }

    public get width() {
        return width;
    }

    public get height() {
        return height;
    }

    public get draw() {
        return this.state.draw;
    }
}
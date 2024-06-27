import { ISystem } from "../../Core/System/ISystem";
import { Framebuffer } from "../../Core/Video/Framebuffer";
import { CPU } from "./CPU";
import { LCD } from "./GPU/LCD";
import { PPU } from "./GPU/PPU";
import { MMU } from "./MMU";
import { State } from "./State";

export class GameBoy implements ISystem {

    private cpu : CPU;
    private mmu : MMU;
    private state : State;
    private ppu : PPU;
    private lcd : LCD;
    private paused : boolean = false;

    constructor(rom : Uint8Array) {
        this.mmu = new MMU(0xFFFF);
        this.state = new State(this.mmu);
        this.cpu = new CPU(this.mmu, 4194304, this.state);
        this.lcd = new LCD(this.mmu, this.state);
        this.ppu = new PPU(this.state, this.mmu, this.lcd);

        this.mmu.loadProgram(rom, 0x0100);
    }
    
    public update(keys: string[]): void {
        
        if (this.paused)
            return;

        let cyclesToRun = Math.floor(this.cpu.freq / 60);

        while (cyclesToRun >= 0) {

            let cyclesTaken : number;

            if (!this.state.halted) {
                const opcode = this.cpu.stepCycle();
                cyclesTaken = opcode.cyclesTaken;
            } else {
                this.cpu.handleInterrupts();
                cyclesTaken = 4;
            }
            
            this.ppu.stepCycle(cyclesTaken);
            cyclesToRun -= cyclesTaken;
        }
    }
    
    public get framebuffer() : Framebuffer {
        return this.ppu.framebuffer;
    }
    
    public pause(): void {
        this.paused = !this.paused;
    }
    
    public reset(): void {
        this.state.reset();
    }
    
    public get width(): number {
        return this.ppu.width;
    }
    
    public get height(): number {
        return this.ppu.height;
    }

    public get draw(): boolean {
        return true;    
    }
}
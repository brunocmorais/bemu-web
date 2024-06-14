import { SM83 } from "../../Core/CPU/SM83/SM83";
import { State } from "../../Core/CPU/SM83/State";
import { ISystem } from "../../Core/System/ISystem";
import { Framebuffer } from "../../Core/Video/Framebuffer";
import { MMU } from "./MMU";

export class GameBoy implements ISystem {

    private cpu : SM83;
    private mmu : MMU;
    private state : State;

    constructor() {
        this.state = new State();
        this.mmu = new MMU(0);
        this.cpu = new SM83(this.mmu, 4194304, this.state);
    }
    
    public update(keys: string[]): void {
        
        let cyclesToRun = Math.floor(this.cpu.freq / 60);

        while (cyclesToRun >= 0 && this.state.halted) {
            this.cpu.stepCycle();
        }
    }
    
    public getCurrentFrame(): Framebuffer {
        throw new Error("Method not implemented.");
    }
    
    public pause(): void {
        throw new Error("Method not implemented.");
    }
    
    public reset(): void {
        throw new Error("Method not implemented.");
    }
    
    public get width(): number {
        throw new Error("Method not implemented.");
    }
    
    public get height(): number {
        throw new Error("Method not implemented.");
    }
}
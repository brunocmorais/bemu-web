import { ISystem } from "../../Core/System/ISystem";
import { BIOS } from "./BIOS";
import { cycleNumber, height, startAddress, width } from "./Constants";
import { Interpreter } from "./Interpreter";
import { MMU } from "./MMU";
import { PPU } from "./PPU";
import { State } from "./State";

export class Chip8 implements ISystem {

    private readonly state: State;
    private readonly mmu: MMU;
    private readonly ppu: PPU;
    private readonly interpreter: Interpreter;
    private cycles: number;

    constructor(bytes: Uint8Array) {
        this.state = new State();
        this.state.reset();
        this.mmu = new MMU(0x1000);
        this.ppu = new PPU(this.state, this.mmu);
        this.interpreter = new Interpreter(this.state, this.mmu, this.ppu);
        this.cycles = 0;
        this.initializeBIOS();
        this.mmu.loadProgram(bytes, startAddress);
    }

    private initializeBIOS() {
        for (let i = 0; i < BIOS.numbers.length; i++)
            this.mmu.set(i, BIOS.numbers[i]);

        for (let i = 0; i < BIOS.numbersHiRes.length; i++)
            this.mmu.set(i + 0x50, BIOS.numbersHiRes[i]);
    }

    public update(keys : string[]) {

        if (this.state.halted)
            return;

        this.cycles = cycleNumber;
        this.state.updateKeys(keys);

        if (this.state.delay > 0)
            this.state.delay--;

        if (this.state.sound > 0)
            this.state.sound--;

        while (!this.state.halted && this.cycles >= 0) {
            var opcode = this.interpreter.fetch();
            this.cycles -= opcode.cyclesTaken;
        }
    }

    public getCurrentFrame() {
        return this.ppu.framebuffer;
    }

    public pause() {
        this.state.halted = !this.state.halted;
    }

    public reset() {
        this.ppu.framebuffer.clear();
        this.state.reset();
    }

    public get width() {
        return width;
    }

    public get height() {
        return height;
    }
}
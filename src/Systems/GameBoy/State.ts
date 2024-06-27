import { Flags } from "../../Core/CPU/SM83/Flags";
import { State as BaseState } from "../../Core/CPU/SM83/State";
import { InterruptType } from "./InterruptType";
import { MMU } from "./MMU";
import { Timer } from "./Timer";

export class State extends BaseState {
    private readonly mmu: MMU;
    public timer;

    constructor(mmu : MMU) {
        super();
        this.mmu = mmu;
        this.timer = new Timer(this.mmu, this);
    }

    public get ie() { return this.mmu.get(0xFFFF); }
    public set ie(value: number) { this.mmu.set(0xFFFF, value); }

    public get if() { return this.mmu.get(0xFF0F); }
    public set if(value: number) { this.mmu.set(0xFF0F, value); }

    public enableInterrupt(type : InterruptType) {
        this.ie |= (0x1 << type) & 0xFF;
    }

    public requestInterrupt(type : InterruptType) {
        this.if |= (0x1 << type) & 0xFF;
    }

    public override reset() {
        super.reset();
        this.timer = new Timer(this.mmu, this);
    }

    private static getState(mmu : MMU) {
        
        const state = new State(mmu);
        state.flags = new Flags();

        state.enableInterrupts = false;
        state.cycles = 0;
        state.halted = false;
        state.instructions = 0;
        state.pc = 0x0100;
        state.sp = 0xFFFE;

        state.flags.zero = true;
        state.flags.subtract = false;
        state.flags.halfCarry = false;
        state.flags.carry = false;

        return state;
    }

    public static getDMGState(mmu : MMU) {
        const state = this.getState(mmu);

        state.a = 0x1;
        state.bc = 0x0013;
        state.de = 0x00D8;
        state.hl = 0x014D;

        const io = mmu.io;

        io[0x00] = 0xCF;
        io[0x01] = 0x00;
        io[0x02] = 0x7E;
        io[0x04] = 0xAB;
        io[0x05] = 0x00;
        io[0x06] = 0x00;
        io[0x07] = 0xF8;
        io[0x0F] = 0xE1;
        io[0x10] = 0x80;
        io[0x11] = 0xBF;
        io[0x12] = 0xF3;
        io[0x13] = 0xFF;
        io[0x14] = 0xBF;
        io[0x16] = 0x3F;
        io[0x17] = 0x00;
        io[0x18] = 0xFF;
        io[0x19] = 0xBF;
        io[0x1A] = 0x7F;
        io[0x1B] = 0xFF;
        io[0x1C] = 0x9F;
        io[0x1D] = 0xFF;
        io[0x1E] = 0xBF;
        io[0x20] = 0xFF;
        io[0x21] = 0x00;
        io[0x22] = 0x00;
        io[0x23] = 0xBF;
        io[0x24] = 0x77;
        io[0x25] = 0xF3;
        io[0x26] = 0xF1;
        io[0x40] = 0x91;
        io[0x41] = 0x85;
        io[0x42] = 0x00;
        io[0x43] = 0x00;
        io[0x44] = 0x00;
        io[0x45] = 0x00;
        io[0x46] = 0xFF;
        io[0x47] = 0xFC;
        io[0x48] = 0xFF;
        io[0x49] = 0xFF;
        io[0x4A] = 0x00;
        io[0x4B] = 0x00;
        io[0x4D] = 0xFF;
        io[0x4F] = 0xFF;
        io[0x51] = 0xFF;
        io[0x52] = 0xFF;
        io[0x53] = 0xFF;
        io[0x54] = 0xFF;
        io[0x55] = 0xFF;
        io[0x56] = 0xFF;
        io[0x68] = 0xFF;
        io[0x69] = 0xFF;
        io[0x6A] = 0xFF;
        io[0x6B] = 0xFF;
        io[0x70] = 0xFF;

        return state;
    }

    public static getCGBState(mmu : MMU) {
        
        const state = this.getState(mmu);

        state.a = 0x11;
        state.bc = 0x0000;
        state.de = 0xFF56;
        state.hl = 0x000D;

        const io = mmu.io;

        io[0x00] = 0xCF;
        io[0x01] = 0x00;
        io[0x02] = 0x7F;
        io[0x04] = 0x00;
        io[0x05] = 0x00;
        io[0x06] = 0x00;
        io[0x07] = 0xF8;
        io[0x0F] = 0xE1;
        io[0x10] = 0x80;
        io[0x11] = 0xBF;
        io[0x12] = 0xF3;
        io[0x13] = 0xFF;
        io[0x14] = 0xBF;
        io[0x16] = 0x3F;
        io[0x17] = 0x00;
        io[0x18] = 0xFF;
        io[0x19] = 0xBF;
        io[0x1A] = 0x7F;
        io[0x1B] = 0xFF;
        io[0x1C] = 0x9F;
        io[0x1D] = 0xFF;
        io[0x1E] = 0xBF;
        io[0x20] = 0xFF;
        io[0x21] = 0x00;
        io[0x22] = 0x00;
        io[0x23] = 0xBF;
        io[0x24] = 0x77;
        io[0x25] = 0xF3;
        io[0x26] = 0xF1;
        io[0x40] = 0x91;
        io[0x41] = 0x00;
        io[0x42] = 0x00;
        io[0x43] = 0x00;
        io[0x44] = 0x00;
        io[0x45] = 0x00;
        io[0x46] = 0x00;
        io[0x47] = 0xFC;
        io[0x48] = 0x00;
        io[0x49] = 0x00;
        io[0x4A] = 0x00;
        io[0x4B] = 0x00;
        io[0x4D] = 0xFF;
        io[0x4F] = 0xFF;
        io[0x51] = 0xFF;
        io[0x52] = 0xFF;
        io[0x53] = 0xFF;
        io[0x54] = 0xFF;
        io[0x55] = 0xFF;
        io[0x56] = 0xFF;
        io[0x68] = 0x00;
        io[0x69] = 0x00;
        io[0x6A] = 0x00;
        io[0x6B] = 0x00;
        io[0x70] = 0xFF;

        return state;
    }

    public toString() {

        return  "\n AF = " + this.af.toString(16).padEnd(4, '0').toUpperCase() +
                "\n BC = " + this.bc.toString(16).padEnd(4, '0').toUpperCase() +
                "\n DE = " + this.de.toString(16).padEnd(4, '0').toUpperCase() +
                "\n HL = " + this.hl.toString(16).padEnd(4, '0').toUpperCase() +
                "\n SP = " + this.sp.toString(16).padEnd(4, '0').toUpperCase() +
                "\n PC = " + this.pc.toString(16).padEnd(4, '0').toUpperCase();
    }
}
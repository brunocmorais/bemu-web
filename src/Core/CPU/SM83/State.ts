import { LittleEndian } from "../../Util/LittleEndian";
import { Flags } from "./Flags";

export class State {

    public a;
    public b;
    public c;
    public d;
    public e;
    public h;
    public l;
    public flags : Flags;
    public pc : number;
    public sp : number;
    public enableInterrupts : boolean;
    public halted: boolean;

    constructor() {
        this.a = 0;
        this.b = 0;
        this.c = 0;
        this.d = 0;
        this.e = 0;
        this.h = 0;
        this.l = 0;
        this.flags = new Flags();
        this.pc = 0;
        this.sp = 0;
        this.enableInterrupts = false;
        this.halted = false;
    }

    public get bc() {
        return LittleEndian.getWordFrom2Bytes(this.c, this.b);
    }

    public set bc(value: number) {
        const [b, c] = LittleEndian.get2BytesFromWord(value);
        this.b = b; this.c = c;
    }

    public get de() {
        return LittleEndian.getWordFrom2Bytes(this.e, this.d);
    }

    public set de(value: number) {
        const [d, e] = LittleEndian.get2BytesFromWord(value);
        this.d = d; this.e = e;
    }

    public get hl() {
        return LittleEndian.getWordFrom2Bytes(this.l, this.h);
    }

    public set hl(value: number) {
        const [h, l] = LittleEndian.get2BytesFromWord(value);
        this.h = h; this.l = l;
    }

    public get f() {
        return ((this.flags.zero ? 1 : 0) << 7 |
                (this.flags.subtract ? 1 : 0) << 6 |
                (this.flags.halfCarry ? 1 : 0) << 5 |
                (this.flags.carry ? 1 : 0) << 4);
    }

    public set f(value: number) {

        this.flags.zero = (value & 0x80) === 0x80;
        this.flags.subtract = (value & 0x40) === 0x40;
        this.flags.halfCarry = (value & 0x20) === 0x20;
        this.flags.carry = (value & 0x10) === 0x10;
    }

    public get af() {
        return LittleEndian.getWordFrom2Bytes(this.f, this.a);
    }

    public set af(value: number) {
        const [a, f] = LittleEndian.get2BytesFromWord(value);
        this.a = a; this.f = f;
    }

    public toString() {
        return "\n AF = " + this.af.toString(16).padStart(4, '0').toUpperCase() +
                "\n BC = " + this.bc.toString(16).padStart(4, '0').toUpperCase() +
                "\n DE = " + this.de.toString(16).padStart(4, '0').toUpperCase() +
                "\n HL = " + this.hl.toString(16).padStart(4, '0').toUpperCase() +
                "\n SP = " + this.sp.toString(16).padStart(4, '0').toUpperCase() +
                "\n PC = " + this.pc.toString(16).padStart(4, '0').toUpperCase();
    }

    public reset() {
        this.a = 0;
        this.b = 0;
        this.c = 0;
        this.d = 0;
        this.e = 0;
        this.h = 0;
        this.l = 0;
        this.flags = new Flags();
        this.pc = 0;
        this.sp = 0;
        this.enableInterrupts = false;
        this.halted = false;
    }
}
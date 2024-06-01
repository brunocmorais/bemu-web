import { LittleEndian } from "../../Util/LittleEndian";
import { Flags } from "./Flags";
import { Ports } from "./Ports";


export class State {

    public pc : number;
    public sp : number;
    public a: number;
    public b: number;
    public c: number;
    public d: number;
    public e: number;
    public h: number;
    public l: number;
    public flags: Flags;
    public ports: Ports;
    public enableInterrupts: boolean;
    public halted: boolean;

    constructor() {
        this.pc = 0;
        this.sp = 0;
        this.a = 0;
        this.b = 0;
        this.c = 0;
        this.d = 0;
        this.e = 0;
        this.h = 0;
        this.l = 0;
        this.flags = new Flags();
        this.ports = new Ports();
        this.enableInterrupts = false;
        this.halted = false;
    }

    public reset() {
        this.pc = 0;
        this.sp = 0;
        this.a = 0;
        this.b = 0;
        this.c = 0;
        this.d = 0;
        this.e = 0;
        this.h = 0;
        this.l = 0;
        this.flags = new Flags();
        this.ports = new Ports();
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
        return ((this.flags.sign ? 1 : 0) << 7 |
            (this.flags.zero ? 1 : 0) << 6 |
            (this.flags.auxiliaryCarry ? 1 : 0) << 4 |
            (this.flags.parity ? 1 : 0) << 2 |
            (1 << 1) |
            (this.flags.carry ? 1 : 0));
    }

    public get af() {
        return LittleEndian.getWordFrom2Bytes(this.f, this.a);
    }
}

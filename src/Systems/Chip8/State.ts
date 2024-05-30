import { keysInOrder } from "./Constants";

export class State {
    
    public pc: number;
    public sp: number;
    public halted: boolean;
    public v: number[];
    public keys: boolean[];
    public i: number;
    public stack: number[];
    public delay: number;
    public sound: number;
    public draw: boolean;
    public superChipMode: boolean;
    public r: number[];

    constructor() {

        this.pc = 0;
        this.sp = 0;
        this.halted = false;
        this.v = [];
        this.keys = [];
        this.i = 0;
        this.stack = [];
        this.delay = 0;
        this.sound = 0;
        this.draw = false;
        this.superChipMode = false;
        this.r = [];
    }

    public reset() {
        this.pc = 0x200;
        this.sp = 0;
        this.halted = false;
        this.v = new Array<number>(16).fill(0);
        this.keys = new Array<boolean>(16).fill(false);
        this.i = 0;
        this.stack = new Array<number>(16).fill(0);
        this.delay = 0;
        this.sound = 0;
        this.draw = false;
        this.superChipMode = false;
        this.r = new Array<number>(8).fill(0);
    }

    public setChip8Mode() {
        this.superChipMode = false;
    }
    
    public setSuperChipMode() {
        this.superChipMode = true;
    }

    public updateKeys(keys : string[]) {

        for (let i = 0; i < this.keys.length; i++)
            this.keys[i] = keys.indexOf(keysInOrder[i]) >= 0;
    }
}
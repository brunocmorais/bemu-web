import { LittleEndian } from "../../Util/LittleEndian";
import { State } from "./State";
import { MMU } from "../../../Systems/SpaceInvaders/MMU";

export class Intel8080 {

    private mmu : MMU;
    private state : State;

    constructor() {
        this.mmu = new MMU(0x10000);
        this.state = new State();
    }

    private getNextWord() {
        const b1 = this.mmu.get(this.state.pc++);
        const b2 = this.mmu.get(this.state.pc++);
        return LittleEndian.getWordFrom2Bytes(b1, b2);
    }

    private getNextByte() {
        return this.mmu.get(this.state.pc++);
    }

    protected readWordFromMemory(addr : number) {
        const a = this.mmu.get(addr);
        const b = this.mmu.get(addr + 1);
        return LittleEndian.getWordFrom2Bytes(a, b);
    }

    protected writeWordToMemory(addr : number, word : number) {
        const [a, b] = LittleEndian.get2BytesFromWord(word);
        this.mmu.set(addr, b);
        this.mmu.set(addr + 1, a);
    }
}


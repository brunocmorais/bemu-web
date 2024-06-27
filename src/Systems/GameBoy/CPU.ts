import { Opcode } from "../../Core/CPU/SM83/Opcode";
import { SM83 } from "../../Core/CPU/SM83/SM83";
import { MMU } from "./MMU";
import { State } from "./State";

export class CPU extends SM83 {

    constructor(mmu: MMU, freq: number, state: State) {
        super(mmu, freq, state);
    }

    public stepCycle(): Opcode {
        
        const opcode = super.stepCycle();
        const state = this.state as State;

        state.timer.updateTimers(opcode.cyclesTaken);

        return opcode;
    }
    
    public handleInterrupts() {

        const state = this.state as State;
        
        if (state.ie === 0 || state.if === 0)
            return;

        for (let i = 0; i < 5; i++) {
            const mask = (0x1 << i);

            if ((state.ie & state.if & mask) === mask) {
                state.halted = false;

                if (!state.enableInterrupts)
                    return;

                state.enableInterrupts = false;
                this.rst((0x40 + (0x8 * i)) & 0xFFFF);
                state.if &= (~mask) & 0xFF;
                break;
            }
        }
    }
}
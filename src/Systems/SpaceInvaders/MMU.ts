import { MMU as AbstractMMU } from "../../Core/Memory/MMU";
import { State } from "./State";

export class MMU extends AbstractMMU {
    private readonly state: State;

    constructor(size: number, state : State) {
        super(size);
        this.state = state;
    }

    public override set(address: number, value: number): void {
        if (address >= 0x2400 && address <= 0x10400)
            this.state.draw = true;
        
        super.set(address, value);
    }
}

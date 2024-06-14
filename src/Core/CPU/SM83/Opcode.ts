
export class Opcode {

    public readonly value: number;
    public cyclesTaken: number = 0;

    constructor(opcode: number) {
        this.value = opcode;
    }
}

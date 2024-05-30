export class Opcode {

    public readonly value: number;
    public readonly cyclesTaken = 1;

    constructor(value: number) {
        this.value = value;
    }

    public get nnn() {
        return this.value & 0x0FFF;
    }

    public get kk() {
        return this.value & 0xFF;
    }

    public get x() {
        return ((this.value & 0x0F00) >> 8) & 0xFF;
    }

    public get y() {
        return ((this.value & 0x00F0) >> 4) & 0xFF;
    }

    public get nibble() {
        return ((this.value & 0x000F)) & 0xFF;
    }
}
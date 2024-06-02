export class Pixel {
    public value: number;
    public get R() { return (((this.value & (0xFF << 24)) >> 24) >>> 0); }
    public get G() { return ((this.value & (0xFF << 16)) >> 16); }
    public get B() { return ((this.value & (0xFF << 8)) >> 8); }
    public get A() { return this.value & 0xFF; }

    constructor(value: number)
    {
        this.value = value;
    }
}
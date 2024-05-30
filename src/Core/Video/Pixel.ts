export class Pixel {
    public readonly value: number;
    public get R() { return ((this.value & (0xFF << 24) >> 24) & 0xFF); }
    public get G() { return ((this.value & (0xFF << 16) >> 16) & 0xFF); }
    public get B() { return ((this.value & (0xFF <<  8) >>  8) & 0xFF); }
    public get A() { return ((this.value & 0xFF) & 0xFF); }

    constructor(value: number)
    {
        this.value = value;
    }
}
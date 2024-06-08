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

    public equals(other: Pixel) {
        return this.R === other.R &&
            this.G === other.G &&
            this.B === other.B &&
            this.A === other.A;
    }

    public static from(r: number, g: number, b: number, a: number) {
        return new Pixel(((r << 24) | (g << 16) | (b << 8) | a) >>> 0);
    }
}
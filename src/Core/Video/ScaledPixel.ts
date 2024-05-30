import { Pixel } from "./Pixel";

export class ScaledPixel {

    private pixels: Pixel[];
    public readonly scale: number;

    constructor(scale: number, defaultValue?: Pixel) {
        this.scale = scale;
        this.pixels = new Array<Pixel>(scale * scale);

        if (defaultValue)
            for (let i = 0; i < this.pixels.length; i++)
                this.pixels[i] = defaultValue;
    }

    public get = (x: number, y: number) => this.pixels[y * this.scale + x];
    public set = (x: number, y: number, value: Pixel) => this.pixels[y * this.scale + x] = value;
}
import { Pixel } from "../Video/Pixel";

export abstract class Image {

    public readonly width: number;
    public readonly height: number;
    protected pixels: Pixel[];

    protected constructor(width: number, height: number) {

        this.width = width;
        this.height = height;
        this.pixels = new Array<Pixel>(this.length);
    }

    public get length() {
        return this.width * this.height;
    }

    protected getIndex(x: number, y: number) {
        return (y * this.width) + x;
    }

    protected get(x: number, y: number) {
        return this.pixels[this.getIndex(x, y)];
    }

    protected set(x: number, y: number, value: Pixel) {
        this.pixels[this.getIndex(x, y)] = value;
    }

    public abstract toBytes(): Uint8Array;

    public abstract get extension() : string;
}

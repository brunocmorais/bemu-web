import { Pixel } from "./Pixel";
import { ScaledPixel } from "./ScaledPixel";

export class Framebuffer {

    private readonly _data: number[];
    private readonly _width: number;
    private readonly _height: number;

    constructor(width: number, height: number) {
        this._width = width;
        this._height = height;
        this._data = new Array<number>(width * height * 4).fill(0);

        for (let i = 0; i < this.width; i++)
            for (let j = 0; j < this.height; j++)
                this.set(i, j, new Pixel(0xFF));
    }

    public get data() {
        return this._data;
    }

    public get width() {
        return this._width;
    }

    public get height() {
        return this._height;
    }

    private getIndex = (x: number, y: number) => (y * this.width * 4) + (x * 4);

    public get(x: number, y: number) {
        const start = this.getIndex(x, y);
        return new Pixel(((this.data[start] << 24) | (this.data[start + 1] << 16) | (this.data[start + 2] << 8) | (this.data[start + 3])) >>> 0);
    }

    public set(x: number, y: number, pixel: Pixel) {
        const num = pixel.value;
        const start = this.getIndex(x, y);

        this.data[start]     = ((num & 0xFF000000) >> 24) & 0xFF;
        this.data[start + 1] = ((num & 0x00FF0000) >> 16) & 0xFF;
        this.data[start + 2] = ((num & 0x0000FF00) >> 8)  & 0xFF;
        this.data[start + 3] = ((num & 0x000000FF))       & 0xFF;
    }

    public setScaledPixel(pixel: ScaledPixel, x: number, y: number)
    {
        const scale = pixel.scale;

        for (let i = 0; i < scale; i++)
            for (let j = 0; j < scale; j++)
                this.set(i + (x * scale), j + (y * scale), pixel.get(i, j));
    }
}
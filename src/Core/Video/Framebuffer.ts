import { Pixel } from "./Pixel";
import { ScaledPixel } from "./ScaledPixel";

export class Framebuffer {

    protected readonly _data: number[];
    protected readonly _width: number;
    protected readonly _height: number;

    constructor(width: number, height: number) {
        this._width = width;
        this._height = height;
        this._data = new Array<number>(width * height * 4).fill(0);
        this.clear();
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

    public clear() {
        for (let i = 0; i < this.width; i++)
            for (let j = 0; j < this.height; j++)
                this.set(i, j, new Pixel(0xFF));
    }

    public get(x: number, y: number) {
        const start = this.getIndex(x, y);
        return new Pixel(((this.data[start] << 24) | (this.data[start + 1] << 16) | (this.data[start + 2] << 8) | (this.data[start + 3])) >>> 0);
    }

    public set(x: number, y: number, pixel: Pixel) {
        const start = this.getIndex(x, y);

        this.data[start]     = pixel.R;
        this.data[start + 1] = pixel.G;
        this.data[start + 2] = pixel.B;
        this.data[start + 3] = pixel.A;
    }

    public setScanline(x: number, y: number, pixels: number[]) {
        const start = this.getIndex(x, y);

        for (let i = 0; i < pixels.length; i++) {
            const padding = i * 4;
            const pixel = pixels[i];

            this.data[start + padding]     = ((pixel & 0xFF000000) >> 24) >>> 0;
            this.data[start + padding + 1] = ((pixel & 0x00FF0000) >> 16);
            this.data[start + padding + 2] = ((pixel & 0x0000FF00) >> 8);
            this.data[start + padding + 3] = ((pixel & 0x000000FF));
        }
    }

    public setVerticalLine(x: number, y: number, pixels: number[]) {
        const start = this.getIndex(x, y);
        const width = this.width;

        for (let i = 0; i < pixels.length; i++) {
            const padding = i * width * 4;
            const pixel = pixels[i];

            this.data[start + padding]     = ((pixel & 0xFF000000) >> 24) >>> 0;
            this.data[start + padding + 1] = ((pixel & 0x00FF0000) >> 16);
            this.data[start + padding + 2] = ((pixel & 0x0000FF00) >> 8);
            this.data[start + padding + 3] = ((pixel & 0x000000FF));
        }
    }

    public setScaledPixel(pixel: ScaledPixel, x: number, y: number) {
        const scale = pixel.scale;

        for (let i = 0; i < scale; i++)
            for (let j = 0; j < scale; j++)
                this.set(i + (x * scale), j + (y * scale), pixel.get(i, j));
    }

    public setSquarePixel(pixels: number[], scale: number, x: number, y: number) {

        for (let i = 0; i < scale; i++) {
            for (let j = 0; j < scale; j++) {
                const pixel = pixels[j * scale + i];
                const start = this.getIndex(i + (x * scale), j + (y * scale));

                this.data[start]     = ((pixel & 0xFF000000) >> 24) >>> 0;
                this.data[start + 1] = ((pixel & 0x00FF0000) >> 16);
                this.data[start + 2] = ((pixel & 0x0000FF00) >> 8);
                this.data[start + 3] = ((pixel & 0x000000FF));
            }
        }
    }
}
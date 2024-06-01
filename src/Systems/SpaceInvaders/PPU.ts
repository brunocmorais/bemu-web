import { Framebuffer } from "../../Core/Video/Framebuffer";
import { Pixel } from "../../Core/Video/Pixel";
import { height, vRAMAddress, width } from "./Constants";
import { MMU } from "./MMU";

export class PPU {

    private readonly _framebuffer: Framebuffer;
    private readonly mmu : MMU;

    constructor(mmu : MMU) {
        this._framebuffer = new Framebuffer(width, height);
        this.mmu = mmu;
    }

    public get framebuffer() {
        for (let y = 0; y < height; y++)
            for (let x = 0; x < width; x++)
                this._framebuffer.set(x, y, this.get(x, y));

        return this._framebuffer;
    }

    private get(x: number, y: number) {
        y = (height - 1 - y);
        const sprite = this.mmu.get(vRAMAddress + Math.floor(Math.floor(x * height / 8) + y / 8));

        if ((sprite & (1 << y % 8)) > 0) {
            if (y >= 0 && y <= 100)
                return new Pixel(0x00FF00FF);
            else if (y > 100 && y <= 200)
                return new Pixel(0xFFFFFFFF);
            else
                return new Pixel(0xFF0000FF);
        }

        return new Pixel(0x000000FF);
    }
}

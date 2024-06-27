import { Framebuffer } from "../../Core/Video/Framebuffer";
import { height, vRAMAddress, width } from "./Constants";
import { MMU } from "./MMU";

const blackSprite = [
    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF
];

const blackPixel = 0x000000FF;

export class PPU {

    private readonly _framebuffer: Framebuffer;
    private readonly mmu : MMU;

    constructor(mmu : MMU) {
        this._framebuffer = new Framebuffer(width, height);
        this.mmu = mmu;
    }

    public get framebuffer() {
        return this._framebuffer;
    }

    public update() {
        for (let y = 0; y < height; y += 8)
            for (let x = 0; x < width; x++)
                this._framebuffer.setVerticalLine(x, y, this.get(x, y));
    }

    private get(x: number, y: number) {
        y = (height - 1 - y);
        const sprite = this.mmu.get(vRAMAddress + ((x * height) >> 3) + (y >> 3));

        if (sprite <= 0)
            return blackSprite;

        let pixel : number;

        if (y >= 0 && y <= 100)
            pixel = 0x00FF00FF;
        else if (y > 100 && y <= 200)
            pixel = 0xFFFFFFFF;
        else
            pixel = 0xFF0000FF;

        return [ 
            (sprite & 0x80) === 0x80 ? pixel : blackPixel,
            (sprite & 0x40) === 0x40 ? pixel : blackPixel,
            (sprite & 0x20) === 0x20 ? pixel : blackPixel,
            (sprite & 0x10) === 0x10 ? pixel : blackPixel,
            (sprite & 0x08) === 0x08 ? pixel : blackPixel,
            (sprite & 0x04) === 0x04 ? pixel : blackPixel,
            (sprite & 0x02) === 0x02 ? pixel : blackPixel,
            (sprite & 0x01) === 0x01 ? pixel : blackPixel,
        ];
    }
}

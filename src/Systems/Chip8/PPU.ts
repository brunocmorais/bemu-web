import { LittleEndian } from "../../Core/Util/LittleEndian";
import { Framebuffer } from "../../Core/Video/Framebuffer";
import { Pixel } from "../../Core/Video/Pixel";
import { ScaledPixel } from "../../Core/Video/ScaledPixel";
import { width, height } from "./Constants";
import { MMU } from "./MMU";
import { State } from "./State";

export class PPU {
    private readonly _framebuffer: Framebuffer;
    private readonly state: State;
    private readonly mmu: MMU;

    constructor(state: State, mmu: MMU) {
        this.state = state;
        this.mmu = mmu;
        this._framebuffer = new Framebuffer(width, height);
    }

    private get width() {
        if (this.state.superChipMode)
            return width;

        return width / 2;
    }

    private get height() {
        if (this.state.superChipMode)
            return height;

        return height / 2;
    }

    public get framebuffer() {
        return this._framebuffer;
    }

    private get(x: number, y: number) {
        if (this.state.superChipMode)
            return this._framebuffer.get(x, y);
        else
            return this._framebuffer.get((x * 2) + 1, (y * 2) + 1);
    }

    private set(x: number, y: number, value: Pixel) {
        if (this.state.superChipMode)
            this._framebuffer.set(x, y, value);
        else
            this._framebuffer.setScaledPixel(new ScaledPixel(2, value), x, y);
    }

    public drw(x: number, y: number, n: number) {

        if (n === 0) {
            this.drwSuperChip(x, y);
            return;
        }
        
        const sprite = new Array<number>(n).fill(0);

        for (let i = 0; i < n; i++)
            sprite[i] = this.mmu.get(this.state.i + i);

        let coordX = this.state.v[x];
        let coordY = this.state.v[y];

        let collision = false;

        for (let i = 0; i < n; i++) {
            let originalSprite = 0;

            for (let j = 0; j < 8; j++) {
                const pixel = this.get((coordX + j) % this.width, coordY).value === 0xFFFFFFFF;
                originalSprite |= ((pixel ? 1 : 0) << (7 - j));
            }
            
            const resultSprite = (originalSprite ^ sprite[i]);

            if ((originalSprite & resultSprite) !== originalSprite)
                collision = true;

            for (let j = 7; j >= 0; j--) {
                const pixel = ((resultSprite & (0x1 << j)) >> j) === 1; 
                this.set(((coordX + (7 - j)) % this.width), coordY, new Pixel(pixel ? 0xFFFFFFFF: 0x000000FF));
            }

            coordY++;
            coordY %= this.height;
        }

        this.state.v[0xF] = (collision ? 1 : 0);
        this.state.draw = true;
    }

    private drwSuperChip(x: number, y: number) {
        let sprite = new Array<number>(16);

        for (let i = 0; i < 16; i++)
            sprite[i] = LittleEndian.getWordFrom2Bytes(this.mmu.get(this.state.i + (2 * i) + 1), this.mmu.get(this.state.i + (2 * i)));

        let coordX = this.state.v[x];
        let coordY = this.state.v[y];
        let collision = false;

        for (let i = 0; i < 16; i++) {
            let originalSprite = 0;

            for (let j = 0; j < 16; j++)
            {
                const pixel = this.get((coordX + j) % this.width, coordY).value === (0xFFFFFFFF);
                originalSprite |= ((pixel ? 1 : 0) << (15 - j)) & 0xFFFF;
            }
            
            const resultSprite = (originalSprite ^ sprite[i]) & 0xFFFF;

            if ((originalSprite & resultSprite) != originalSprite)
                collision = true;

            for (let j = 15; j >= 0; j--) {
                const pixel = ((resultSprite & (0x1 << j)) >> j) === 1; 
                this.set(((coordX + (15 - j)) % this.width) & 0xFF, coordY, new Pixel(pixel ? 0xFFFFFFFF: 0x000000FF));
            }

            coordY++;
            coordY %= (this.height & 0xFF);
        }

        this.state.v[0xF] = (collision ? 1 : 0);
        this.state.draw = true;
    }

    public scrollRight() {
        for (let i = this.width - 1; i >= 0; i--) {
            for (let j = this.height - 1; j >= 0; j--) {
                if ((i - 4) < 0)
                    this.set(i, j, new Pixel(0x000000FF));
                else
                    this.set(i, j, this.get(i - 4, j));
            }
        }

        this.state.draw = true;
    }
    
    public scrollLeft() {
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                if ((i + 4) > this.width)
                    this.set(i, j, new Pixel(0x000000FF));
                else
                    this.set(i, j, this.get(i + 4, j));
            }   
        }

        this.state.draw = true;
    }

    public clearScreen() {
        for (let i = 0; i < this.width; i++)
            for (let j = 0; j < this.height; j++)
                this.set(i, j, new Pixel(0x000000FF));

        this.state.draw = true;
    }

    public scrollDown(nibble: number) {
        for (let i = this.width - 1; i >= 0; i--) {
            for (let j = this.height - 1; j >= 0; j--) {
                if ((j - nibble) < 0)
                    this.set(i, j, new Pixel(0x000000FF));
                else
                    this.set(i, j, this.get(i, j - nibble));
            }   
        }

        this.state.draw = true;
    }

    public scrollUp(nibble: number) {
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                if ((j + nibble) > this.width)
                    this.set(i, j, new Pixel(0x000000FF));
                else
                    this.set(i, j, this.get(i, j + nibble));
            }   
        }

        this.state.draw = true;
    }
}
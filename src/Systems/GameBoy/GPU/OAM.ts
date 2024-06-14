import { MMU } from "../MMU";
import { Sprite } from "./Sprite";

export class OAM { 
    private readonly mmu : MMU;
    private readonly oam : number[];
    private readonly enumerable : number[] = [...Array(40).keys()];

    constructor(mmu : MMU) {
        this.mmu = mmu;
        this.oam = new Array<number>(160);
    }

    public get(index : number) {
        return this.oam[index];
    }

    public set(index : number, value: number) {
        this.oam[index] = value;
    }

    public getSpritesForScanline(ly : number, spriteSize : number) {
        let counter = 0;
        const sprites = this.enumerable.map(x => this.getSprite(x));
        const ret = [];

        for (const sprite of sprites.filter(x => x != null).sort((a, b) => a.x - b.x)) {
            
            if (counter === 10) // limit of 10 sprites per line
                break;

            if (sprite.x <= -8 || sprite.x >= 168 || sprite.y <= -8 || sprite.y >= 144)
                continue;

            let lineOffset = ly - sprite.y;

            if (sprite.yFlip)
                lineOffset = spriteSize - lineOffset - 1;

            if (lineOffset < 0 || lineOffset >= spriteSize)
                continue;

            sprite.lineOffset = lineOffset;
            sprite.size = spriteSize;
            counter++;

            ret.push(sprite);
        }

        return ret;
    }

    private getSprite(index : number) {
        index *= 4;

        return new Sprite(
            this.get(index + 1) - 8,
            this.get(index + 0) - 16,
            this.get(index + 2),
            this.get(index + 3)
        );
    }

    public startDMATransfer(value : number) {
        var oamStartAddress = (value << 8);

        for (let i = 0; i <= 0x9F; i++)
            this.set(i, this.mmu.get(oamStartAddress + i));
    }
}
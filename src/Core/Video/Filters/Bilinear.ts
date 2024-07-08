import { Framebuffer } from "../Framebuffer";
import { Filter } from "./Filter";
import { FilterType } from "./FilterType";
import { Util } from "./Util";

export class Bilinear extends Filter {

    constructor(framebuffer : Framebuffer) {
        super(framebuffer, 2);
    }
    
    public update() {
        
        const xScale = this.scaled.width;
        const yScale = this.scaled.height;

        for (let x = 0; x < this.framebuffer.width; x++) {
            for (let y = 0; y < this.framebuffer.height; y++) {
                for (let i = 0; i < 2; i++) {
                    for (let j = 0; j < 2; j++) {
                        const gx = (i + (x * 2)) / xScale * (this.framebuffer.width - 1);
                        const gy = (j + (y * 2)) / yScale * (this.framebuffer.height - 1);
                        const gxi = Math.floor(gx);
                        const gyi = Math.floor(gy);
                        const c00 = this.get(gxi, gyi);
                        const c10 = this.get(gxi + 1, gyi);
                        const c01 = this.get(gxi, gyi + 1);
                        const c11 = this.get(gxi + 1, gyi + 1);
                        const tx = gx - gxi;
                        const ty = gy - gyi;
                        const r = Util.blerp((c00 >> 24) & 0xFF, (c10 >> 24) & 0xFF, (c01 >> 24) & 0xFF, (c11 >> 24) & 0xFF, tx, ty);
                        const g = Util.blerp((c00 >> 16) & 0xFF, (c10 >> 16) & 0xFF, (c01 >> 16) & 0xFF, (c11 >> 16) & 0xFF, tx, ty);
                        const b = Util.blerp((c00 >>  8) & 0xFF, (c10 >>  8) & 0xFF, (c01 >>  8) & 0xFF, (c11 >>  8) & 0xFF, tx, ty);

                        this.scaled.setNumber(i + (x * 2), j + (y * 2), ((r << 24) | (g << 16) | (b << 8) | 0xFF));
                    }
                }
            }
        }
    }

    public get type() {
        return FilterType.Bilinear;
    }
}
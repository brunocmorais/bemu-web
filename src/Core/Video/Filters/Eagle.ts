import { Pixel } from "../Pixel";
import { ScaledPixel } from "../ScaledPixel";
import { Filter } from "./Filter";
import { FilterType } from "./FilterType";

type NeighborPixels = {
    s : Pixel, 
    t : Pixel, 
    u : Pixel,  
    v : Pixel,  
    c : Pixel,  
    w : Pixel,  
    x : Pixel,  
    y : Pixel,  
    z : Pixel
}

export class Eagle extends Filter {
    
    constructor(width: number, height: number) {
        super(width, height, 2);
    }
    
    public override update() {
        
        for (let x = 0; x < this.framebuffer.width; x++) {
            for (let y = 0; y < this.framebuffer.height; y++) {
                const pixel2x = new ScaledPixel(2);

                const adj : NeighborPixels = {
                    s: this.get(x - 1, y - 1), t: this.get(x, y - 1), u: this.get(x + 1, y - 1),
                    v: this.get(x - 1, y + 0), c: this.get(x, y + 0), w: this.get(x + 1, y + 0),
                    x: this.get(x - 1, y + 1), y: this.get(x, y + 1), z: this.get(x + 1, y + 1),
                };
                
                pixel2x.set(0, 0, (adj.v.value === adj.s.value && adj.s.value === adj.t.value && adj.s.value !== 0) ? adj.s : adj.c);
                pixel2x.set(1, 0, (adj.t.value === adj.u.value && adj.u.value === adj.w.value && adj.u.value !== 0) ? adj.u : adj.c);
                pixel2x.set(0, 1, (adj.v.value === adj.x.value && adj.x.value === adj.y.value && adj.x.value !== 0) ? adj.x : adj.c);
                pixel2x.set(1, 1, (adj.w.value === adj.z.value && adj.z.value === adj.y.value && adj.z.value !== 0) ? adj.z : adj.c);

                this.scaled.setScaledPixel(pixel2x, x, y);
            }
        }

        return this.scaled;
    }

    public override get type() {
        return FilterType.Eagle;
    }
}
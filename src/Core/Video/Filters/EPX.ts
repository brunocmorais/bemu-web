import { Pixel } from "../Pixel";
import { ScaledPixel } from "../ScaledPixel";
import { Filter } from "./Filter";
import { FilterType } from "./FilterType";

type NeighborPixels = {
               a : Pixel, 
    c : Pixel, p : Pixel, b : Pixel,
               d : Pixel;
}

export class EPX extends Filter {
    
    constructor(width: number, height: number) {
        super(width, height, 2);
    }
    
    public override update() {
        
        for (let x = 0; x < this.framebuffer.width; x++) {
            for (let y = 0; y < this.framebuffer.height; y++) {
                var pixel2x = new ScaledPixel(2);
                var pixel = this.get(x, y);
                        
                var adj : NeighborPixels = { 
                                            a : this.get(x, y - 1),
                    c : this.get(x - 1, y), p : this.get( x ,  y ), b : this.get(x + 1, y),
                                            d : this.get(x, y + 1),
                };

                pixel2x.set(0, 0, pixel);
                pixel2x.set(1, 0, pixel);
                pixel2x.set(0, 1, pixel);
                pixel2x.set(1, 1, pixel);

                if (adj.c.value === adj.a.value && adj.c.value !== adj.d.value && adj.a.value !== adj.b.value) 
                    pixel2x.set(0, 0, adj.a);

                if (adj.a.value === adj.b.value && adj.a.value !== adj.c.value && adj.b.value !== adj.d.value) 
                    pixel2x.set(1, 0, adj.b);

                if (adj.d.value === adj.c.value && adj.d.value !== adj.b.value && adj.c.value !== adj.a.value) 
                    pixel2x.set(0, 1, adj.c);

                if (adj.b.value === adj.d.value && adj.b.value !== adj.a.value && adj.d.value !== adj.c.value) 
                    pixel2x.set(1, 1, adj.d);

                this.scaled.setScaledPixel(pixel2x, x, y);
            }
        }

        return this.scaled;
    }

    public get type(): FilterType {
        return FilterType.EPX;
    }
}
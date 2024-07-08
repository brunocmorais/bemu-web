import { Framebuffer } from "../Framebuffer";
import { ScaledPixel } from "../ScaledPixel";
import { Filter } from "./Filter";
import { FilterType } from "./FilterType";

type NeighborPixels = {
    a : number; 
    b : number; 
    c : number; 
    d : number; 
    e : number; 
    f : number; 
    g : number; 
    h : number; 
    i : number;
};

export class Scale3x extends Filter {
    
    constructor(framebuffer : Framebuffer) {
        super(framebuffer, 3);
    }
    
    public update() {

        const pixel3x = new ScaledPixel(3);
        const adj : NeighborPixels = {
            a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, h: 0, i: 0
        };
        
        for (let x = 0; x < this.framebuffer.width; x++) {
            for (let y = 0; y < this.framebuffer.height; y++) {

                adj.a = this.get(x - 1, y - 1); 
                adj.b = this.get(x, y - 1); 
                adj.c = this.get(x + 1, y - 1);
                adj.d = this.get(x - 1, y); 
                adj.e = this.get(x, y); 
                adj.f = this.get(x + 1, y);
                adj.g = this.get(x - 1, y + 1); 
                adj.h = this.get(x, y + 1); 
                adj.i = this.get(x + 1, y + 1);

                pixel3x.setAll(adj.e);
                
                if (adj.d == adj.b && adj.d != adj.h && adj.b != adj.f) 
                    pixel3x.set(0, 0, adj.d);
                if ((adj.d == adj.b && adj.d != adj.h && adj.b != adj.f && adj.e != adj.c) || 
                    (adj.b == adj.f && adj.b != adj.d && adj.f != adj.h && adj.e != adj.a)) 
                    pixel3x.set(1, 0, adj.b);
                if (adj.b == adj.f && adj.b != adj.d && adj.f != adj.h) 
                    pixel3x.set(2, 0, adj.f);
                if ((adj.h == adj.d && adj.h != adj.f && adj.d != adj.b && adj.e != adj.a) || 
                    (adj.d == adj.b && adj.d != adj.h && adj.b != adj.f && adj.e != adj.g)) 
                    pixel3x.set(0, 1, adj.d);

                if ((adj.b == adj.f && adj.b != adj.d && adj.f != adj.h && adj.e != adj.i) || 
                    (adj.f == adj.h && adj.f != adj.b && adj.h != adj.d && adj.e != adj.c)) 
                    pixel3x.set(2, 1, adj.f);
                if (adj.h == adj.d && adj.h != adj.f && adj.d != adj.b) 
                    pixel3x.set(0, 2, adj.d);
                if ((adj.f == adj.h && adj.f != adj.b && adj.h != adj.d && adj.e != adj.g) || 
                    (adj.h == adj.d && adj.h != adj.f && adj.d != adj.b && adj.e != adj.i)) 
                    pixel3x.set(1, 2, adj.h);
                if (adj.f == adj.h && adj.f != adj.b && adj.h != adj.d) 
                    pixel3x.set(2, 2, adj.f);
                
                this.scaled.setScaledPixel(pixel3x, x, y);
            }
        }
    }

    public get type(): FilterType {
        return FilterType.Scale3x;
    }
}
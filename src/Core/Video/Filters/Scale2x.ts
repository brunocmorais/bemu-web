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

export class Scale2x extends Filter {
    
    constructor(framebuffer : Framebuffer) {
        super(framebuffer, 2);
    }
    
    public update() {
        
        const pixel2x = new ScaledPixel(2);
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

                if (adj.b !== adj.h && adj.d !== adj.f) {
                    pixel2x.set(0, 0, adj.d === adj.b ? adj.d : adj.e);
                    pixel2x.set(1, 0, adj.b === adj.f ? adj.f : adj.e);
                    pixel2x.set(0, 1, adj.d === adj.h ? adj.d : adj.e);
                    pixel2x.set(1, 1, adj.h === adj.f ? adj.f : adj.e);
                } else {
                    pixel2x.setAll(adj.e);
                }
                
                this.scaled.setScaledPixel(pixel2x, x, y);
            }
        }
    }

    public get type(): FilterType {
        return FilterType.Scale2x;
    }
}
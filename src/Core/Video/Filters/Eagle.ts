import { Framebuffer } from "../Framebuffer";
import { Pixel } from "../Pixel";
import { ScaledPixel } from "../ScaledPixel";
import { Filter } from "./Filter";
import { FilterType } from "./FilterType";

type NeighborPixels = {
    s : number, 
    t : number, 
    u : number,  
    v : number,  
    c : number,  
    w : number,  
    x : number,  
    y : number,  
    z : number
}

export class Eagle extends Filter {
    
    constructor(framebuffer : Framebuffer) {
        super(framebuffer, 2);
    }
    
    public override update() {

        const pixel2x = new ScaledPixel(2, 0xFF);
        let adj : NeighborPixels = { c: 0, s: 0, t: 0, u: 0, v: 0, w: 0, x: 0, y: 0, z: 0 };
        
        for (let x = 0; x < this.framebuffer.width; x++) {
            for (let y = 0; y < this.framebuffer.height; y++) {

                adj.s = this.get(x - 1, y - 1);
                adj.t = this.get(x, y - 1);
                adj.u = this.get(x + 1, y - 1);
                adj.v = this.get(x - 1, y);
                adj.c = this.get(x, y);
                adj.w = this.get(x + 1, y);
                adj.x = this.get(x - 1, y + 1);
                adj.y = this.get(x, y + 1);
                adj.z = this.get(x + 1, y + 1);
                
                pixel2x.set(0, 0, (adj.v === adj.s && adj.s === adj.t && adj.s !== 0) ? adj.s : adj.c);
                pixel2x.set(1, 0, (adj.t === adj.u && adj.u === adj.w && adj.u !== 0) ? adj.u : adj.c);
                pixel2x.set(0, 1, (adj.v === adj.x && adj.x === adj.y && adj.x !== 0) ? adj.x : adj.c);
                pixel2x.set(1, 1, (adj.w === adj.z && adj.z === adj.y && adj.z !== 0) ? adj.z : adj.c);

                this._scaled.setScaledPixel(pixel2x, x, y);
            }
        }
    }

    public override get type() {
        return FilterType.Eagle;
    }
}
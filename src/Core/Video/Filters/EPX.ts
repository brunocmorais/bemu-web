import { Framebuffer } from "../Framebuffer";
import { ScaledPixel } from "../ScaledPixel";
import { Filter } from "./Filter";
import { FilterType } from "./FilterType";

type NeighborPixels = {
    a : number,
    b : number,
    c : number,
    p : number,
    d : number;
}

export class EPX extends Filter {

    constructor(framebuffer : Framebuffer) {
        super(framebuffer, 2);
    }

    public override update() {

        const scaled = new ScaledPixel(2, 0xFF);
        const adj : NeighborPixels = { a: 0, c: 0, p: 0, b: 0, d: 0 };

        for (let x = 0; x < this.framebuffer.width; x++) {
            for (let y = 0; y < this.framebuffer.height; y++) {
                adj.a = this.get(x, y - 1);
                adj.c = this.get(x - 1, y);
                adj.p = this.get(x, y);
                adj.b = this.get(x + 1, y);
                adj.d = this.get(x, y + 1);

                scaled.set(0, 0, adj.c === adj.a && adj.c !== adj.d && adj.a !== adj.b ? adj.a : adj.p);
                scaled.set(1, 0, adj.a === adj.b && adj.a !== adj.c && adj.b !== adj.d ? adj.b : adj.p);
                scaled.set(0, 1, adj.d === adj.c && adj.d !== adj.b && adj.c !== adj.a ? adj.c : adj.p);
                scaled.set(1, 1, adj.b === adj.d && adj.b !== adj.a && adj.d !== adj.c ? adj.d : adj.p);

                this._scaled.setScaledPixel(scaled, x, y);
            }
        }
    }

    public get type(): FilterType {
        return FilterType.EPX;
    }
}
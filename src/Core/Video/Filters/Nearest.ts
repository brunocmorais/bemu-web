import { ScaledPixel } from "../ScaledPixel";
import { Filter } from "./Filter";
import { FilterType } from "./FilterType";

export class Nearest extends Filter {
    
    constructor(width: number, height: number) {
        super(width, height, 2);
    }

    public override update() {
        for (let x = 0; x < this.framebuffer.width; x++) {
            for (let y = 0; y < this.framebuffer.height; y++) {
                this.scaled.setScaledPixel(new ScaledPixel(2, this.get(x, y)), x, y);
            }
        }

        return this.scaled;
    }
    
    public get type() {
        return FilterType.Nearest;
    }
}
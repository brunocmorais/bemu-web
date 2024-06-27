import { Framebuffer } from "../Framebuffer";
import { ScaledPixel } from "../ScaledPixel";
import { Filter } from "./Filter";
import { FilterType } from "./FilterType";

const scale = 2;

export class Nearest extends Filter {
    
    constructor(framebuffer : Framebuffer) {
        super(framebuffer, scale);
    }

    public override update() {

        const pixel = new ScaledPixel(scale, 0xFF);
        
        for (let x = 0; x < this.framebuffer.width; x++) {
            for (let y = 0; y < this.framebuffer.height; y++) {
                const value = this.framebuffer.getNumber(x, y);
                pixel.setAll(value);
                this._scaled.setScaledPixel(pixel, x, y);
            }
        }
    }
    
    public get type() {
        return FilterType.Nearest;
    }
}
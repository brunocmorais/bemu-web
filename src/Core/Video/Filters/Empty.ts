import { Framebuffer } from "../Framebuffer";
import { Filter } from "./Filter";
import { FilterType } from "./FilterType";

export class Empty extends Filter {
    
    constructor(width: number, height: number) {
        super(width, height, 1);
    }
    
    public update(): Framebuffer {
        return this.framebuffer;
    }

    public get type(): FilterType {
        return FilterType.None;
    }
}
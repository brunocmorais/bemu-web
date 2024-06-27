import { Framebuffer } from "../Framebuffer";
import { Filter } from "./Filter";
import { FilterType } from "./FilterType";

export class Empty extends Filter {
    
    constructor(framebuffer : Framebuffer) {
        super(framebuffer, 1);
    }
    
    public update() {
        // nothing
    }

    public get type(): FilterType {
        return FilterType.None;
    }

    public override get scaled() {
        return this.framebuffer;
    }
}
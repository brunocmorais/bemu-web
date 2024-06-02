import { Framebuffer } from "../Framebuffer";
import { Pixel } from "../Pixel";
import { FilterType } from "./FilterType";

export abstract class Filter {

    protected framebuffer! : Framebuffer;
    protected readonly scaled : Framebuffer;

    constructor(width: number, height: number, scaleFactor : number)
    {
        this.scaled = new Framebuffer(width * scaleFactor, height * scaleFactor);
    }

    protected get(x : number, y : number) {

        if (x < 0 || y < 0 || x >= this.framebuffer.width || y >= this.framebuffer.height)
            return new Pixel(0xFF);

        return this.framebuffer.get(x, y);
    }

    public abstract update() : Framebuffer;

    public get width() {
        return this.scaled.width;
    }

    public get height() {
        return this.scaled.height;
    }

    public set frame(frame : Framebuffer) {
        this.framebuffer = frame;
    }

    public abstract get type() : FilterType;
}
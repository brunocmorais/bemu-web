import { Framebuffer } from "../Framebuffer";
import { FilterType } from "./FilterType";

export abstract class Filter {

    protected framebuffer : Framebuffer;
    public readonly _scaled : Framebuffer;

    constructor(framebuffer : Framebuffer, scaleFactor : number)
    {
        this.framebuffer = framebuffer;
        this._scaled = new Framebuffer(this.framebuffer.width * scaleFactor, this.framebuffer.height * scaleFactor);
    }

    protected get(x : number, y : number) {

        if (x < 0 || y < 0 || x >= this.framebuffer.width || y >= this.framebuffer.height)
            return 0xFF;

        return this.framebuffer.getNumber(x, y);
    }

    public abstract update() : void;

    public get width() {
        return this._scaled.width;
    }

    public get height() {
        return this._scaled.height;
    }

    public get scaled() {
        return this._scaled;
    }

    public abstract get type() : FilterType;
}
import { Framebuffer } from "../Video/Framebuffer";

export interface ISystem {
    update(keys : string[]) : void;
    get framebuffer() : Framebuffer;
    pause() : void;
    reset() : void;
    get width() : number;
    get height() : number;
    get draw() : boolean;
}
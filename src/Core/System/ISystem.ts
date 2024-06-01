import { Framebuffer } from "../Video/Framebuffer";

export interface ISystem {
    update(keys : string[]) : void;
    getCurrentFrame() : Framebuffer;
    pause() : void;
    reset() : void;
    get width() : number;
    get height() : number;
}
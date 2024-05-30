import { Framebuffer } from "../Video/Framebuffer";

export interface ISystem {
    update(keys : string[]) : void;
    getCurrentFrame() : Framebuffer | undefined;
    get width() : number;
    get height() : number;
}
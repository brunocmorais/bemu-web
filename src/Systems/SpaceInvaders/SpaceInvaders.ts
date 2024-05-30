import { ISystem } from "../../Core/System/ISystem";
import { Framebuffer } from "../../Core/Video/Framebuffer";

export class SpaceInvaders implements ISystem {
    
    
    public update(keys: string[]): void {
        throw new Error("Method not implemented.");
    }

    public getCurrentFrame(): Framebuffer | undefined {
        throw new Error("Method not implemented.");
    }

    public get width(): number {
        throw new Error("Method not implemented.");
    }

    public get height(): number {
        throw new Error("Method not implemented.");
    }
}
import { ISystem } from "../Core/System/ISystem";
import { Chip8 } from "./Chip8/Chip8";
import { SystemType } from "./SystemType";


const systemTypesByExtension = {
    ".ch8": SystemType.Chip8,
    ".zip": SystemType.SpaceInvaders
};

export const supportedExtensions = Object.keys(systemTypesByExtension);

export class SystemFactory {

    public static get(extension : string, rom : Uint8Array) : ISystem {

        const type = this.getType(extension);

        switch (type) {
            case SystemType.Chip8: return new Chip8(rom);
            case SystemType.SpaceInvaders: throw new Error();
            default: throw new Error();
        }
    }

    private static getType(extension : string) {
        return (Object.entries(systemTypesByExtension).find((item) => item[0] === extension))?.[1];
    }
}

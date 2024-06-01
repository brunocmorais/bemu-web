import { ISystem } from "../Core/System/ISystem";
import { Chip8 } from "./Chip8/Chip8";
import { ROMReader } from "./SpaceInvaders/ROMReader";
import { SpaceInvaders } from "./SpaceInvaders/SpaceInvaders";
import { SystemType } from "./SystemType";


const systemTypesByExtension = {
    ".ch8": SystemType.Chip8,
    ".zip": SystemType.SpaceInvaders
};

export const supportedExtensions = Object.keys(systemTypesByExtension);

export class SystemFactory {

    public static async get(extension : string, file : Uint8Array) : Promise<ISystem> {

        const type = this.getType(extension);

        switch (type) {
            case SystemType.Chip8: 
                return new Chip8(file);
            case SystemType.SpaceInvaders: 
                const rom = await ROMReader.read(file);
                return new SpaceInvaders(rom);
            default: throw new Error();
        }
    }

    private static getType(extension : string) {
        return (Object.entries(systemTypesByExtension).find((item) => item[0] === extension))?.[1];
    }
}

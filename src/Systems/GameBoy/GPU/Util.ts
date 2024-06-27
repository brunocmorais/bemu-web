import { ColorPaletteData } from "./ColorPaletteData";
import { PaletteType } from "./PaletteType"

export class Util {
    public static readonly backgroundPalettes : PaletteType[] = [
        PaletteType.BG0, PaletteType.BG1, PaletteType.BG2, PaletteType.BG3, 
        PaletteType.BG4, PaletteType.BG5, PaletteType.BG6, PaletteType.BG7
    ];

    public static colorToRGB(color : number) {
        const r = ((color & 0x001F) >>  0) * 8;
        const g = ((color & 0x03E0) >>  5) * 8;
        const b = ((color & 0x7C00) >> 10) * 8;

        return ((r << 24) | (g << 16) | (b << 8) | 0xFF) >>> 0;
    }

    public static shadeToRGB(colorPalette : IColorPalette, paletteBytes : number, colorNumber : number) {

        const bitOffset = (colorNumber * 2);
        const shadeNumber = ((paletteBytes & (3 << bitOffset)) >> bitOffset);

        switch (shadeNumber) {
            case 0: return colorPalette.shade0;
            case 1: return colorPalette.shade1;
            case 2: return colorPalette.shade2;
            case 3: return colorPalette.shade3;
            default: throw new Error("Invalid shade!");
        }
    }

    public static getIndexFromPalette(type : PaletteType)
    {
        switch (type) {
            case PaletteType.BG0:
            case PaletteType.OBJ0:
                return 0;
            case PaletteType.BG1:
            case PaletteType.OBJ1:
                return 8;
            case PaletteType.BG2:
            case PaletteType.OBJ2:
                return 16;
            case PaletteType.BG3:
            case PaletteType.OBJ3:
                return 24;
            case PaletteType.BG4:
            case PaletteType.OBJ4:
                return 32;
            case PaletteType.BG5:
            case PaletteType.OBJ5:
                return 40;
            case PaletteType.BG6:
            case PaletteType.OBJ6:
                return 48;
            case PaletteType.BG7:
            case PaletteType.OBJ7:
                return 56;
            default:
                throw new Error("Invalid palette type!");
        }
    }

    public static getBGColors(colorPaletteData : ColorPaletteData) {

        const ret = [];

        for (const paletteType of this.backgroundPalettes) {
            const pos = this.getIndexFromPalette(paletteType);
            const firstByte = colorPaletteData.backgroundPalettes[pos];
            const secondByte = colorPaletteData.backgroundPalettes[pos + 1];
            
            ret.push(this.colorToRGB(((secondByte << 8) | firstByte) & 0xFFFF));
        }

        return ret;
    }
}
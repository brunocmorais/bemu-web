import { ColorPaletteData } from "./ColorPaletteData";
import { IPaletteData } from "./IPaletteData";
import { MonochromePaletteData } from "./MonochromePaletteData";
import { PaletteType } from "./PaletteType";
import { Util } from "./Util";

export class Palette {
    private readonly palette : number[];
    public type : PaletteType;
    public address : number;
    
    constructor(type : PaletteType, address : number) {
        this.palette = new Array<number>(Palette.paletteSize);
        this.type = type;
        this.address = address;
    }

    public static get paletteSize() {
        return 8;
    }

    public get(index: number) {
        return this.palette[index];
    }

    public get length() { return this.palette.length; }

    private isColorPalette() {
        switch (this.type) {
            case PaletteType.BGP:
            case PaletteType.OBP0:
            case PaletteType.OPB1:
                return false;
            default:
                return true;
        }
    }

    private isBackgroundPalette() {
        switch (this.type) {
            case PaletteType.BG0:
            case PaletteType.BG1:
            case PaletteType.BG2:
            case PaletteType.BG3:
            case PaletteType.BG4:
            case PaletteType.BG5:
            case PaletteType.BG6:
            case PaletteType.BG7:
            case PaletteType.BGP:
                return true;
            default:
                return false;
        }
    }

    private getColorFrom(colorNumber : number, colorPaletteData : ColorPaletteData) {
        let firstByte, secondByte;
        const pos = Util.getIndexFromPalette(this.type) + (colorNumber * 2);

        if (this.isBackgroundPalette()) {
            firstByte = colorPaletteData.backgroundPalettes[pos];
            secondByte = colorPaletteData.backgroundPalettes[pos + 1];
        } else {
            firstByte = colorPaletteData.spritePalettes[pos];
            secondByte = colorPaletteData.spritePalettes[pos + 1];
        }

        return Util.colorToRGB(((secondByte << 8) | firstByte) & 0xFFFF);
    }

    private getShadeFrom(colorPalette : IColorPalette, colorNumber : number, data : MonochromePaletteData) {

        let val = 0;

        switch (this.type) {
            case PaletteType.BGP: val = data.bgp; break;
            case PaletteType.OBP0: val = data.obp0; break;
            case PaletteType.OPB1: val = data.obp1; break;
        }

        return Util.shadeToRGB(colorPalette, val, colorNumber);
    }

    public setColors(data : IPaletteData, tileData : number, horizontalFlip : boolean, colorPalette : IColorPalette) {

        for (let i = 0; i < Palette.paletteSize; i++) {
            let colorNumber = 0;
            const mask1 = (1 << (7 - i));
            const mask2 = (1 << (15 - i));
            const x = horizontalFlip ? (7 - i) : i;
            
            if ((tileData & mask2) == mask2)
                colorNumber += 2;

            if ((tileData & mask1) == mask1)
                colorNumber += 1;

            if (this.isBackgroundPalette() || colorNumber > 0) {
                if (this.isColorPalette())
                    this.palette[x] = this.getColorFrom(colorNumber, data as ColorPaletteData);
                else
                    this.palette[x] = this.getShadeFrom(colorPalette, colorNumber, data as MonochromePaletteData);
            }
            else
                this.palette[x] = 0;
        }
    }
}
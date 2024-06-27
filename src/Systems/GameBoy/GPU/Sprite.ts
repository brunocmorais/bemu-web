import { PaletteType } from "./PaletteType";

export class Sprite {

    public readonly x : number;
    public readonly y : number;
    public readonly address : number;
    public readonly attr : number;
    public lineOffset : number = 0;
    public size : number = 0;

    constructor(x : number, y : number, address: number, attr: number) {
        this.x = x;
        this.y = y;
        this.address = address;
        this.attr = attr;
    }

    public get paletteType() {
        return (this.attr & 0x10) === 0x10 ? PaletteType.OPB1 : PaletteType.OBP0;  
    } 

    public get priority() {
        return (this.attr & 0x80) === 0x80;
    }

    public get xFlip() { 
        return (this.attr & 0x20) === 0x20;
    }

    public get yFlip() { 
        return (this.attr & 0x40) === 0x40;
    }

    public tileVRAMBankNumber() : number {
        return (this.attr & 0x8) === 0x8 ? 1 : 0;
    }

    public get colorPaletteType() {

        switch (this.attr & 7) {
            case 0: return PaletteType.OBJ0;
            case 1: return PaletteType.OBJ1;
            case 2: return PaletteType.OBJ2;
            case 3: return PaletteType.OBJ3;
            case 4: return PaletteType.OBJ4;
            case 5: return PaletteType.OBJ5;
            case 6: return PaletteType.OBJ6;
            case 7: return PaletteType.OBJ7;
            default: return 0;
        }
    }

    public get paletteAddress() {
        return (this.address << 4) + (2 * ((this.lineOffset) % this.size));
    }
}
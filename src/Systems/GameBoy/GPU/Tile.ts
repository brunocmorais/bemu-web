import { BackgroundMap } from "./BackgroundMap";
import { PaletteType } from "./PaletteType";

export class Tile {
    private readonly backgroundMap : BackgroundMap;
    public readonly x : number;
    public readonly y : number;

    constructor(backgroundMap : BackgroundMap, x : number, y : number) {
        this.backgroundMap = backgroundMap;
        this.x = x;
        this.y = y;
    }

    private get map() {
        return this.backgroundMap.window ? 
            this.backgroundMap.windowMapSelect : 
            this.backgroundMap.backgroundMapSelect;
    } 

    private get vram() {
        return this.backgroundMap.mmu.vram;
    } 

    public get tileNumber() {
        return this.vram.bank0[this.mapAddress];
    } 

    public get mapAddress() {
        return (this.map + this.x + (this.y * 0x20)) & 0xFFFF;
    } 
    
    public get tileAddress() {
        if (this.backgroundMap.tileStartAddress === 0) // unsigned
            return (this.backgroundMap.tileStartAddress + (this.tileNumber << 4)) & 0xFFFF;
        else // signed
            return (((this.tileNumber & 0x80) === 0x80 ? 0x800 : 0x1000) + ((this.tileNumber & 0x7F) << 4)) & 0xFFFF;
    }

    public get attribute() {
        return this.vram.bank1[this.mapAddress];
    } 

    public get backgroundPaletteNumber() {
        return ((this.attribute & 0x7) + 3) as PaletteType;
    } 

    public get tileVRAMBankNumber() {
        return (this.attribute & 0x8) === 0x8 ? 1 : 0;
    } 

    public get horizontalFlip() {
        return (this.attribute & 0x20) === 0x20;
    } 

    public get verticalFlip() {
        return (this.attribute & 0x40) === 0x40;
    } 

    public get bGToOAMPriority() {
        return (this.attribute & 0x80) === 0x80;
    }   
}
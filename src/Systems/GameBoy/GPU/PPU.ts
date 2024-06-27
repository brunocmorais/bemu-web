import { State } from "../State";
import { MMU } from "../MMU";
import { BackgroundMap } from "./BackgroundMap";
import { GPUMode } from "./GPUMode";
import { LCD } from "./LCD";
import { LCDC } from "./LCDC";
import { Factory as PaletteFactory } from "./Palettes/Factory";
import { MonochromePaletteType } from "./Palettes/MonochromePaletteType";
import { Sprite } from "./Sprite";
import { STAT } from "./STAT";
import { InterruptType } from "../InterruptType";
import { Framebuffer } from "../../../Core/Video/Framebuffer";
import { Palette } from "./Palette";
import { Tile } from "./Tile";
import { PaletteType } from "./PaletteType";
import { Util } from "./Util";

export class PPU {
    
    public readonly framebuffer : Framebuffer;
    private cycles : number;
    private state : State;
    private mmu : MMU;
    private lcd : LCD;
    private spriteSize : number;
    private lcdEnabled : boolean;
    private bgDisplay : boolean;
    private windowDisplay : boolean;
    private spriteDisplay :  boolean;
    private spritesCurrentLine :  Sprite[];
    private backgroundMap : BackgroundMap;
    private currentLine :  number[];
    private colorPalette : IColorPalette;

    constructor(state : State, mmu : MMU, lcd : LCD) {
        this.state = state;
        this.mmu = mmu;
        this.lcd = lcd;
        this.framebuffer = new Framebuffer(this.width, this.height);
        this.cycles = 0;
        this.spriteSize = 8;
        this.lcdEnabled = true;
        this.bgDisplay = false;
        this.windowDisplay = false;
        this.spriteDisplay = false;
        this.spritesCurrentLine = new Array<Sprite>();
        this.backgroundMap = new BackgroundMap(this.mmu);
        this.currentLine = new Array<number>(this.width);
        this.colorPalette = PaletteFactory.get(MonochromePaletteType.gray);
    }

    public get width() { return 160; }
    public get height() { return 144; }


    private get paletteData() {
        return (this.gbcMode ? this.mmu.colorPalette : this.mmu.monochromePalette);
    } 

    private get gbcMode() {
        return this.mmu.isInGBCMode;
    }

    private turnOffLCD() {
        this.lcd.mode = GPUMode.hblank;
        this.cycles = 0;
        this.lcdEnabled = false;
    }

    public stepCycle(cycles : number) {

        if (!this.lcdEnabled) {
            this.lcdEnabled = this.lcd.getLcdcFlag(LCDC.lcdDisplayEnable);

            if (!this.lcdEnabled)
                return;
        }

        this.cycles += cycles;

        switch (this.lcd.mode) {
            case GPUMode.hblank: this.hblank(); break;
            case GPUMode.vblank: this.vblank(); break;
            case GPUMode.scanlineOam: this.scanlineOam(); break;
            case GPUMode.scanlineVram: this.scanlineVram(); break;
        }
    }

    private scanlineVram() {
        if (this.cycles >= 172) {
            this.lcd.mode = GPUMode.hblank;
            this.cycles -= 172;
        }
    }

    private scanlineOam() {
        
        if (this.cycles >= 80) {
            this.lcd.mode = GPUMode.scanlineVram;

            if (this.lcd.getStatFlag(STAT.mode2OAMInterrupt))
                this.state.requestInterrupt(InterruptType.lcdStat);

            if (this.lcdEnabled && this.spriteDisplay)
                this.spritesCurrentLine = this.mmu.oam.getSpritesForScanline(this.lcd.ly, this.spriteSize);

            this.cycles -= 80;
        }
    }

    private vblank() {

        if (this.cycles >= 456) {
            if (this.lcd.ly === 144)
                this.state.requestInterrupt(InterruptType.vblank);

            if (this.lcd.getStatFlag(STAT.mode1VBlankInterrupt))
                this.state.requestInterrupt(InterruptType.lcdStat);

            this.cycles -= 456;
            this.lcd.ly = ((this.lcd.ly + 1) % 154) & 0xFF;

            if (this.lcd.ly === 0) {
                this.lcd.mode = GPUMode.scanlineOam;
                this.lcdEnabled = this.lcd.getLcdcFlag(LCDC.lcdDisplayEnable);

                if (!this.lcdEnabled)
                    this.turnOffLCD();
            }
        }
    }

    private hblank() {
        
        if (this.cycles >= 204) {
            if (this.lcd.ly < 144)
                this.mmu.vram.executeHBlankDMATransfer();
                
            if (this.lcd.getStatFlag(STAT.mode0HBlankInterrupt))
                this.state.requestInterrupt(InterruptType.lcdStat);

            if (this.lcdEnabled && this.lcd.ly < 144) {
                this.windowDisplay = this.lcd.getLcdcFlag(LCDC.windowDisplayEnable);
                this.spriteDisplay = this.lcd.getLcdcFlag(LCDC.spriteDisplayEnable);
                this.spriteSize = this.lcd.getLcdcFlag(LCDC.spriteSize) ? 16 : 8;
                this.bgDisplay = this.lcd.getLcdcFlag(LCDC.bgDisplayEnable);

                this.renderscan();
            }

            this.lcd.ly++;
            this.cycles -= 204;
            this.lcd.mode = this.lcd.ly === 144 ? GPUMode.vblank : GPUMode.scanlineOam;
        }
    }

    private renderscan() {
        if (this.bgDisplay || this.gbcMode)
            this.renderBgWindowScanline();
        
        if (this.spriteDisplay)
            this.renderOamScanline();

        this.updateFramebuffer();
    }

    private updateFramebuffer() {
        for (let i = 0; i < this.currentLine.length; i++)
            this.framebuffer.setNumber(i, this.lcd.ly, this.currentLine[i]);
    }

    private push(palette : Palette, padding : number, x : number) {

        for (let i = 0; i < palette.length; i++) {
            const x2 = (i + (x * 8)) - (padding % 8);

            if (x2 >= 0 && x2 < this.width)
                this.currentLine[x2] = palette.get(i);
        }
    }

    private renderBgWindowScanline() {
        const windowEnabled = this.windowDisplay && this.lcd.ly >= this.lcd.wy;
        this.backgroundMap.windowMapSelect = this.lcd.getLcdcFlag(LCDC.windowTileMapDisplaySelect) ? 0x1C00 : 0x1800;
        this.backgroundMap.backgroundMapSelect = this.lcd.getLcdcFlag(LCDC.bgTileMapDisplaySelect) ? 0x1C00 : 0x1800;
        this.backgroundMap.tileStartAddress = this.lcd.getLcdcFlag(LCDC.bgWindowTileDataSelect) ? 0x0000 : 0x0800;
        const wx = this.lcd.wx - 7;

        for (let x = 0; x <= (this.width / Palette.paletteSize); x++) {

            if (windowEnabled && x * Palette.paletteSize >= wx) {
                this.backgroundMap.window = true;
                const line = (this.lcd.ly - this.lcd.wy) & 0xff;
                const tile = this.getTile(x - (wx / 8), line, 0);
                this.push(this.getBgWindowPalette(tile, line), wx, x);
            } else if (this.bgDisplay) {
                this.backgroundMap.window = false;
                const line = (this.lcd.ly + this.lcd.scy) & 0xff;
                const tile = this.getTile(x, line, this.lcd.scx);
                this.push(this.getBgWindowPalette(tile, line), this.lcd.scx, x);
            }
        }
    }

    private getBgWindowPalette(tile : Tile, line : number) {
        const type = this.gbcMode ? tile.backgroundPaletteNumber : PaletteType.BGP;
        let address : number;

        if (tile.verticalFlip)
            address = tile.tileAddress + (2 * ((7 - (line % 8))));
        else
            address = tile.tileAddress + (2 * (line % 8));

        const palette = new Palette(type, address);

        const tileData = this.getTileData(tile.tileVRAMBankNumber, palette.address);
        palette.setColors(this.paletteData, tileData, tile.horizontalFlip, this.colorPalette);
        
        return palette;
    }

    private getTileData(tileDataBankNumber : number, address : number) {
        if (tileDataBankNumber === 0)
            return ((this.mmu.vram.bank0[address + 1] << 8) | this.mmu.vram.bank0[address]) & 0xFFFF;
        else
            return ((this.mmu.vram.bank1[address + 1] << 8) | this.mmu.vram.bank1[address]) & 0xFFFF;
    }
    
    private getTile(x : number, line : number, padding : number) {
        const xb = this.backgroundMap.getCoordinateFromPadding((8 * x) + padding);
        const yb = this.backgroundMap.getCoordinateFromPadding((line));

        return this.backgroundMap.get(xb % 32, yb % 32);
    }

    private renderOamScanline() {

        for (const sprite of this.spritesCurrentLine) { 
            const type = this.gbcMode ? sprite.colorPaletteType : sprite.paletteType;
            const palette = new Palette(type, sprite.paletteAddress);
            let tileData : number;

            if (this.gbcMode) {
                if (sprite.tileVRAMBankNumber() === 1)
                    tileData = ((this.mmu.vram.bank1[palette.address + 1] << 8) | this.mmu.vram.bank1[palette.address]) & 0xFFFF;
                else
                    tileData = ((this.mmu.vram.bank0[palette.address + 1] << 8) | this.mmu.vram.bank0[palette.address]) & 0xFFFF;
            }
            else
                tileData = ((this.mmu.vram.get(palette.address + 1) << 8) | this.mmu.vram.get(palette.address)) & 0xFFFF;

            palette.setColors(this.paletteData, tileData, sprite.xFlip, this.colorPalette);
            this.drawSpriteCurrentLine(sprite, palette);
        }
    }

    private drawSpriteCurrentLine(sprite : Sprite, palette : Palette) {
        
        for (let i = 0; i < palette.length; i++) {
            
            if (palette.get(i) === 0)
                continue;

            const coordX = i + sprite.x;

            if (coordX >= 0 && coordX < 160) {
                if (this.gbcMode) {
                    if (!sprite.priority || (Util.getBGColors(this.mmu.colorPalette).indexOf(this.currentLine[coordX]) >= 0))
                        this.currentLine[coordX] = palette.get(i);
                } else {
                    const color = Util.shadeToRGB(this.colorPalette, this.mmu.monochromePalette.bgp, 0);

                    if (!sprite.priority || (this.currentLine[coordX] === color))
                        this.currentLine[coordX] = palette.get(i);
                }
            }
        }
    }
}
import { MMU as AbstractMMU } from "../../Core/Memory/MMU";
import { APU } from "../Audio/APU";
import { ColorPaletteData } from "./GPU/ColorPaletteData";
import { VRAM } from "./GPU/VRAM";
import { IMapper } from "./Mappers/IMapper";
import { Joypad } from "./Joypad";
import { MonochromePaletteData } from "./GPU/MonochromePaletteData";
import { OAM } from "./GPU/OAM";
import { WRAM } from "./WRAM";
import { Factory } from "./Mappers/Factory";
import { CartridgeHeader } from "./CartridgeHeader";

export class MMU extends AbstractMMU {

    public readonly vram : VRAM;
    public readonly colorPalette : ColorPaletteData;
    public readonly monochromePalette : MonochromePaletteData;
    public readonly io : number[];
    public readonly oam : OAM;
    private wram : WRAM;
    private zeroPage : number[];
    private mbc : IMapper;
    private joypad : Joypad;
    private apu : APU;
    private gbcMode : boolean;

    constructor(size: number) {
        super(size);
        
        this.vram = new VRAM(this);
        this.io = new Array<number>(0x80);
        this.wram = new WRAM(this);
        this.oam = new OAM(this);
        this.zeroPage = new Array<number>(0x80);
        this.mbc = Factory.get(this, 0x00);
        this.colorPalette = new ColorPaletteData();
        this.monochromePalette = new MonochromePaletteData(this);
        this.joypad = new Joypad();
        this.apu = new APU();
        this.gbcMode = false;
    }

    public override get(addr: number) {

        if (addr >= 0x0000 && addr <= 0x7FFF)
            return this.mbc.readROM(addr);
        else if (addr >= 0x8000 && addr <= 0x9FFF)
            return this.vram.get(addr - 0x8000);
        else if (addr >= 0xA000 && addr <= 0xBFFF)
            return this.mbc.readCartRAM(addr - 0xA000);
        else if (addr >= 0xC000 && addr <= 0xDFFF)
            return this.wram.get(addr - 0xC000);
        else if (addr >= 0xE000 && addr <= 0xFDFF)
            return this.wram.get(addr - 0xE000);
        else if (addr >= 0xFE00 && addr <= 0xFE9F)
            return this.oam.get(addr - 0xFE00);
        else if (addr >= 0xFF00 && addr <= 0xFF7F) {
            if (addr === 0xFF00) // joypad
                return this.joypad.getJoypadInfo();

            if (addr === 0xFF55)
                return this.vram.hdma5;

            if (addr >= 0xFF68 && addr <= 0xFF6B) // paletas de cor
                return this.colorPalette.get(addr);

            return this.io[addr - 0xFF00];
        }
        else if (addr >= 0xFF80 && addr <= 0xFFFF)
            return this.zeroPage[addr - 0xFF80];
        
        return 0xFF;
    }

    public override set(addr: number, value: number) {

        if (addr >= 0x0000 && addr <= 0x7FFF)
            this.mbc.setMode(addr, value);
        else if (addr >= 0x8000 && addr <= 0x9FFF)
            this.vram.set(addr - 0x8000, value);
        else if (addr >= 0xA000 && addr <= 0xBFFF)
            this.mbc.writeCartRAM((addr - 0xA000), value);
        else if (addr >= 0xC000 && addr <= 0xDFFF)
            this.wram.set(addr - 0xC000, value);
        else if (addr >= 0xE000 && addr <= 0xFDFF)
            this.wram.set(addr - 0xE000, value);
        else if (addr >= 0xFE00 && addr <= 0xFE9F)
            this.oam.set(addr - 0xFE00, value);
        else if (addr >= 0xFF00 && addr <= 0xFF7F)
            this.setRegister(addr, value);
        else if (addr >= 0xFF80 && addr <= 0xFFFF)
            this.zeroPage[addr - 0xFF80] = value;
    }

    public setRegister(addr: number, value: number) {
        this.io[addr - 0xFF00] = value;

        if (addr === 0xFF00) // joypad
            this.joypad.setJoypadColumn(value);
        // else if (addr == 0xFF10) // sweep envelope Channel1
        //     APU.StartSweepEnvelope();
        // else if (addr == 0xFF11) // sound length Channel1
        //     APU.StartSound(Sound.GbSoundChannels.Channel1);
        // else if (addr == 0xFF12) // volume envelope Channel1
        //     APU.StartVolumeEnvelope(Sound.GbSoundChannels.Channel1);
        // else if (addr == 0xFF13 || addr == 0xFF14)
        //     APU.StartSound(Sound.GbSoundChannels.Channel1);
        // else if (addr == 0xFF16) // sound length Channel2
        //     APU.StartSound(Sound.GbSoundChannels.Channel2);
        // else if (addr == 0xFF17) // volume envelope Channel2
        //     APU.StartVolumeEnvelope(Sound.GbSoundChannels.Channel2);
        // else if (addr == 0xFF18 || addr == 0xFF19)
        //     APU.StartSound(Sound.GbSoundChannels.Channel2);
        // else if (addr == 0xFF1B) // sound length Channel3
        //     APU.StartSound(Sound.GbSoundChannels.Channel3);
        // else if (addr == 0xFF20) // sound length Channel4
        //     APU.StartSound(Sound.GbSoundChannels.Channel4);
        // else if (addr == 0xFF21) // volume envelope Channel4
        //     APU.StartVolumeEnvelope(Sound.GbSoundChannels.Channel4);
        else if (addr === 0xFF04) // DIV timer
            this.io[addr - 0xFF00] = 0;
        else if (addr === 0xFF46) // OAM DMA
            this.oam.startDMATransfer(value);
        else if (addr === 0xFF55) // VRAM DMA
            this.vram.startDMATransfer(value);
        else if (addr >= 0xFF68 && addr <= 0xFF6B) // color palletes
            this.colorPalette.set(addr, value);
    }

    public override loadProgram(bytes: Uint8Array, startAddress: number) {

        const cartridgeData = CartridgeHeader.read(bytes);
        this.mbc = Factory.get(this, cartridgeData.cartridgeType);
        this.mbc.loadProgram(bytes);
    }

    public get isInGBCMode() {
        return this.gbcMode;
    }
}
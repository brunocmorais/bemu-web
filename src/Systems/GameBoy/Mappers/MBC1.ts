import { MMU } from "../MMU";
import { Mapper } from "./Mapper";

export class MBC1 extends Mapper {
    private mode : number;
    private bank1 : number;
    private bank2 : number;
    private ramg : number;

    constructor(mmu : MMU, ram : boolean) {
        super(mmu, ram);
        this.bank1 = 1;
        this.bank2 = 0;
        this.mode = 0;
        this.ramg = 0;
    }

    protected override get cartRam() {

        if (this.mode === 0)
            return this.ramBanks[0];
        else
            return this.ramBanks[this.bank2];
    }   

    protected override get externalRamSize() { 
        return 8192; 
    }

    protected override get ramBankCount() { 
        return 4; 
    }

    public setMode(addr : number, value : number) {
        if (addr >= 0x0000 && addr <= 0x1FFF)
            this.ramg = value;
        else if (addr >= 0x2000 && addr <= 0x3FFF) {
            if ((value & 0x1F) === 0x00)
                this.bank1 = 0x01;
            else
                this.bank1 = value & 0x1F;
        } else if (addr >= 0x4000 && addr <= 0x5FFF)
            this.bank2 = value & 0x3;
        else if (addr >= 0x6000 && addr <= 0x7FFF)
            this.mode = value & 0x1;
    }

    public override readROM(addr : number) {
        if (addr >= 0x0000 && addr <= 0x3FFF) {
            if (this.mode === 0)
                return this.rom0[addr];
            else
                return this.romBanks[(this.bank2 << 5) % this.romBanks.length][addr];
        } else if (addr >= 0x4000 && addr <= 0x7FFF) {
            if (this.romBanks.length >= 16)
                return this.romBanks[((this.bank2 << 5) | this.bank1) % this.romBanks.length][addr - 0x4000];

            return this.romBanks[this.bank1 % this.romBanks.length][addr - 0x4000];
        }

        return 0xFF;
    }

    public writeCartRAM(addr: number, value: number) {
        if ((this.ramg & 0x0F) === 0x0A)
            this.cartRam[addr] = value;
    }

    public readCartRAM(addr: number) {
        if ((this.ramg & 0x0F) === 0x0A)
            return this.cartRam[addr];

        return 0xFF;
    }
}
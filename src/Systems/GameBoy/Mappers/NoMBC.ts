import { MMU } from "../MMU";
import { Mapper } from "./Mapper";

export class NoMBC extends Mapper {

    protected override get cartRam() { 
        return this.ramBanks[0];
    };

    protected override get externalRamSize() {
        return 8192;
    };

    protected override get ramBankCount() {
        return 1;
    }

    public constructor(mmu : MMU, ram : boolean) {
        super(mmu, ram);
    }

    public override readROM(addr : number) {

        if (addr >= 0x0000 && addr <= 0x3FFF)
            return this.rom0[addr];
        else
            return this.romBanks[1][addr - 0x4000];
    }

    public readCartRAM(addr: number): number {
        // does nothing
        return 0;
    }
    public writeCartRAM(addr: number, value: number): void {
        // does nothing
    }

    public setMode(addr: number, value: number): void {
        // does nothing
    }
}
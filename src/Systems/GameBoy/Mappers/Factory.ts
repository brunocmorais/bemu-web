import { MMU } from "../MMU";
import { NoMBC } from "./NoMBC";

export class Factory {

    public static get(mmu : MMU, type : number) {

        switch (type) {
            case 0x00: return new NoMBC(mmu, false);
            // TODO : implement
            // case 0x01: return new MBC1(mmu, ram: false, battery: false);
            // case 0x02: return new MBC1(mmu, ram: true, battery: false);
            // case 0x03: return new MBC1(mmu, ram: true, battery: true);
            // case 0x05: return new MBC2(mmu, battery: false);
            // case 0x06: return new MBC2(mmu, battery: true);
            // case 0x08: return new NoMBC(mmu, ram: true, battery: false);
            // case 0x09: return new NoMBC(mmu, ram: true, battery: true);
            // case 0x0F: return new MBC3(mmu, ram: false, timer: true, battery: true);
            // case 0x10: return new MBC3(mmu, ram: true, timer: true, battery: true);
            // case 0x11: return new MBC3(mmu, ram: false, timer: false, battery: false);
            // case 0x12: return new MBC3(mmu, ram: true, timer: false, battery: false);
            // case 0x13: return new MBC3(mmu, ram: true, timer: false, battery: true);
            // case 0x19: 
            // case 0x1C: return new MBC5(mmu, ram: false, battery: false);
            // case 0x1A: 
            // case 0x1D: return new MBC5(mmu, ram: true, battery: false);
            // case 0x1B: 
            // case 0x1E: return new MBC5(mmu, ram: true, battery: true);
            default: throw new Error("Unsupported mapper!");
        }
    }
}
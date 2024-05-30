import { LittleEndian } from "../../Core/Util/LittleEndian";
import { MMU } from "./MMU";
import { Opcode } from "./Opcode";
import { PPU } from "./PPU";
import { State } from "./State";

export class Interpreter {

    private readonly state: State;
    private readonly mmu: MMU;
    private readonly ppu: PPU;

    constructor(state: State, mmu: MMU, ppu: PPU) {
        this.state = state;
        this.mmu = mmu;
        this.ppu = ppu;
    }

    public fetch() {
        const lsb = this.mmu.get(this.state.pc++);
        const msb = this.mmu.get(this.state.pc++);
        const opcode = new Opcode(LittleEndian.getWordFrom2Bytes(msb, lsb));

        switch (opcode.value & 0xF000)
        {
            case 0x0000: 
                switch (opcode.value & 0x00F0)
                {
                    case 0x00B0: this.ppu.scrollUp(opcode.nibble); break;
                    case 0x00C0: this.ppu.scrollDown(opcode.nibble); break;
                    case 0x00E0:
                        switch (opcode.value & 0x000F)
                        {
                            case 0x0000: this.ppu.clearScreen(); break;
                            case 0x000E: this.ret(); break;
                            default: throw new Error();
                        }
                        break;
                    case 0x00F0:
                        switch (opcode.value & 0x000F)
                        {
                            case 0x000B: this.ppu.scrollLeft(); break;
                            case 0x000C: this.ppu.scrollRight(); break;
                            case 0x000D: this.quit(); break;
                            case 0x000E: this.state.setChip8Mode(); break;
                            case 0x000F: this.state.setSuperChipMode(); break;
                            default: throw new Error();
                        }
                        break;
                        default: throw new Error();
                }
                break;
            case 0x1000: this.jp(opcode.nnn); break;
            case 0x2000: this.call(opcode.nnn); break;
            case 0x3000: this.seWithByte(opcode.x, opcode.kk); break;
            case 0x4000: this.sneWithByte(opcode.x, opcode.kk); break;
            case 0x5000: this.se(opcode.x, opcode.y); break;
            case 0x6000: this.ldWithByte(opcode.x, opcode.kk); break;
            case 0x7000: this.addWithByte(opcode.x, opcode.kk); break;
            case 0x8000: 
                switch (opcode.value & 0x000F)
                {
                    case 0x0000: this.ld(opcode.x, opcode.y); break;
                    case 0x0001: this.or(opcode.x, opcode.y); break;
                    case 0x0002: this.and(opcode.x, opcode.y); break;
                    case 0x0003: this.xor(opcode.x, opcode.y); break;
                    case 0x0004: this.add(opcode.x, opcode.y); break;
                    case 0x0005: this.sub(opcode.x, opcode.y); break;
                    case 0x0006: this.shr(opcode.x, opcode.y); break;
                    case 0x0007: this.subn(opcode.x, opcode.y); break;
                    case 0x000E: this.shl(opcode.x, opcode.y); break;
                    default: throw new Error();
                }
                break;
            case 0x9000: this.sne(opcode.x, opcode.y); break;
            case 0xA000: this.ldI(opcode.nnn); break; 
            case 0xB000: this.jpV0(opcode.nnn); break;
            case 0xC000: this.rnd(opcode.x, opcode.kk); break;
            case 0xD000: this.ppu.drw(opcode.x, opcode.y, opcode.nibble); break;
            case 0xE000: 
                switch (opcode.value & 0x00FF)
                {
                    case 0x009E: this.skp(opcode.x); break;
                    case 0x00A1: this.sknp(opcode.x); break;
                    default: throw new Error();
                }
                break;
            case 0xF000: 
                switch (opcode.value & 0x00FF)
                {
                    case 0x0007: this.ldVxDt(opcode.x); break;
                    case 0x000A: this.ldVxK(opcode.x); break;
                    case 0x0015: this.ldDtVx(opcode.x); break;
                    case 0x0018: this.ldStVx(opcode.x); break;
                    case 0x001E: this.addIVx(opcode.x); break;
                    case 0x0029: this.ldFVx(opcode.x); break;
                    case 0x0030: this.ldHFVx(opcode.x); break;
                    case 0x0033: this.ldBVx(opcode.x); break;
                    case 0x0055: this.ldIVx(opcode.x); break;
                    case 0x0065: this.ldVxI(opcode.x); break;
                    case 0x0075: this.ldRVx(opcode.x); break;
                    case 0x0085: this.ldVxR(opcode.x); break;
                    default: throw new Error();
                }
                break;
            default: throw new Error();
        }

        return opcode;
    }

    private ret() {
        this.state.sp--;
        this.state.pc = this.state.stack[this.state.sp];
    }
    
    private quit() {
        this.state.halted = true;
    }
    
    private jp(addr: number) {
        this.state.pc = addr;
    }
    
    private call(addr: number) {
        this.state.stack[this.state.sp] = this.state.pc;
        this.state.sp++;
        this.state.pc = addr;
    }
    
    private seWithByte(x: number, kk: number) {
        if (this.state.v[x] === kk)
            this.state.pc += 2;
    }
    
    private sneWithByte(x: number, kk: number) {
        if (this.state.v[x] !== kk)
            this.state.pc += 2;
    }
    
    private se(x: number, y: number) {
        if (this.state.v[x] === this.state.v[y])
            this.state.pc += 2;
    }
    
    private ldWithByte(x: number, kk: number) {
        this.state.v[x] = kk;
    }
    
    private addWithByte(x: number, kk: number) {
        this.state.v[x] += kk;
        this.state.v[x] &= 0xFF;
    }
    
    private ld(x: number, y: number) {
        this.state.v[x] = this.state.v[y];
    }
    
    private or(x: number, y: number) {
        this.state.v[x] |= this.state.v[y];
    }
    
    private and(x: number, y: number) {
        this.state.v[x] &= this.state.v[y];
    }
    
    private xor(x: number, y: number) {
        this.state.v[x] ^= this.state.v[y];
    }
    
    private add(x: number, y: number) {
        this.state.v[x] += this.state.v[y];
        this.state.v[x] &= 0xFF;
        this.state.v[0xF] = (this.state.v[x] + this.state.v[y] > 0xFF ? 1 : 0) & 0xFF;
    }
    
    private sub(x: number, y: number) {
        const vX = this.state.v[x];
        const vY = this.state.v[y];
        this.state.v[x] = (vX - vY) & 0xFF;
        this.state.v[0xF] = (vX > vY ? 1 : 0);
    }
    
    private shr(x: number, y: number) {
        this.state.v[x] >>= 1;
        this.state.v[x] &= 0xFF;
        this.state.v[0xF] = ((this.state.v[x] & 0x1) === 1 ? 1 : 0) & 0xFF;
    }
    
    private subn(x: number, y: number) {
        const vX = this.state.v[x];
        const vY = this.state.v[y];
        this.state.v[x] = (vY - vX) & 0xFF;
        this.state.v[0xF] = (vY > vX ? 1 : 0);
    }
    
    private shl(x: number, y: number) {
        this.state.v[x] <<= 1;
        this.state.v[x] &= 0xFF;
        this.state.v[0xF] = ((this.state.v[x] & 0x80) === 0x80 ? 1 : 0) & 0xFF;
    }
    
    private sne(x: number, y: number) {
        if (this.state.v[x] != this.state.v[y])
            this.state.pc += 2;
    }
    
    private ldI(addr: number) {
        this.state.i = addr;
    }
    
    private jpV0(addr: number) {
        this.state.pc = (addr + this.state.v[0]) & 0xFFFF;
    }
    
    private rnd(x: number, kk: number) {
        const rnd = Math.floor(Math.random() * 0xFF);
        this.state.v[x] = (rnd & kk) & 0xFF;
    }
    
    private skp(x: number) {
        if (this.state.keys[this.state.v[x]])
            this.state.pc += 2;
    }
    
    private sknp(x: number) {
        if (!this.state.keys[this.state.v[x]])
            this.state.pc += 2;
    }
    
    private ldVxDt(x: number) {
        this.state.v[x] = this.state.delay;
    }
    
    private ldVxK(x: number) {
        if (this.state.keys.length === 0) {
            this.state.pc -= 2;
        } else {
            for (let i = 0; i < this.state.keys.length; i++) {
                if (this.state.keys[i])
                    this.state.v[x] = i; 
            }
        }
    }
    
    private ldDtVx(x: number) {
        this.state.delay = this.state.v[x];
    }
    
    private ldStVx(x: number) {
        this.state.sound = this.state.v[x];
    }
    
    private addIVx(x: number) {
        this.state.i += this.state.v[x];
        this.state.i &= 0xFFFF;
    }
    
    private ldFVx(x: number) {
        const value = this.state.v[x];
        this.state.i = (0x5 * value) & 0xFFFF;
    }
    
    private ldHFVx(x: number) {
        const value = this.state.v[x];
        this.state.i = (0x50 + (0xA * value)) & 0xFFFF;
    }
    
    private ldBVx(x: number) {
        const number = this.state.v[x].toString().padStart(3, '0');
        this.mmu.set(this.state.i, parseInt(number[0])); 
        this.mmu.set(this.state.i + 1, parseInt(number[1]));
        this.mmu.set(this.state.i + 2, parseInt(number[2]));
    }
    
    private ldIVx(x: number) {
        for (let i = 0; i <= x; i++) {
            this.mmu.set(i + this.state.i, this.state.v[i]);
        }
    }
    
    private ldVxI(x: number) {
        for (let i = 0; i <= x; i++) {
            this.state.v[i] = this.mmu.get(i + this.state.i);
        }
    }
    
    private ldRVx(x: number) {
        this.state.r[x] = this.state.v[x];
    }
    
    private ldVxR(x: number) {
        this.state.v[x] = this.state.r[x];
    }        
}


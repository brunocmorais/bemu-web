import { MMU } from "../../Memory/MMU";
import { Byte } from "../../Util/Byte";
import { LittleEndian } from "../../Util/LittleEndian";
import { Action } from "./Action";
import { Opcode } from "./Opcode";
import { Register } from "./Register";
import { State } from "./State";

export class SM83 {
    private readonly mmu: MMU;
    private readonly state: State;
    private cycles : number = 0;
    public rstOffset : number = 0;
    public freq: number;

    constructor(mmu : MMU, freq: number, state: State) {
        this.mmu = mmu;
        this.freq = freq;
        this.state = state;
    }

    private getNextWord() {
        const b1 = this.mmu.get(this.state.pc++);
        const b2 = this.mmu.get(this.state.pc++);
        return LittleEndian.getWordFrom2Bytes(b1, b2);
    }

    private getNextByte() {
        return this.mmu.get(this.state.pc++);
    }

    private readByteFromMemory(addr : number) {
        return this.mmu.get(addr);
    }

    private writeByteToMemory(addr : number, value: number) {
        this.mmu.set(addr, value);
    }

    private readWordFromMemory(addr : number) {
        const a = this.mmu.get(addr);
        const b = this.mmu.get(addr + 1);
        return LittleEndian.getWordFrom2Bytes(a, b);
    }

    private writeWordToMemory(addr: number, word: number) {
        const [a, b] = LittleEndian.get2BytesFromWord(word);
        this.mmu.set(addr, b);
        this.mmu.set(addr + 1, a);
    }

    private popStack() {
        const word = this.readWordFromMemory(this.state.sp);
        this.state.sp += 2;
        this.state.sp &= 0xFFFF;
        return word;
    }

    private pushStack(value : number) {
        this.state.sp -= 2;
        this.state.sp &= 0xFFFF;
        this.writeWordToMemory(this.state.sp, value);
    }

    private getByteFromRegister(register : Register) {
        switch (register) {
            case Register.A: return this.state.a;
            case Register.B: return this.state.b;
            case Register.C: return this.state.c;
            case Register.D: return this.state.d;
            case Register.E: return this.state.e;
            case Register.H: return this.state.h;
            case Register.L: return this.state.l;
            case Register.AF: return this.readByteFromMemory(this.state.af);
            case Register.BC: return this.readByteFromMemory(this.state.bc);
            case Register.DE: return this.readByteFromMemory(this.state.de);
            case Register.HL: return this.readByteFromMemory(this.state.hl);
            case Register.SP: return this.readByteFromMemory(this.state.sp);
            case Register.PC: return this.readByteFromMemory(this.state.pc);
            default: throw new Error("Unknown register!");
        }
    }

    private getWordFromRegister(register : Register) {
        switch (register) {
            case Register.AF: return this.state.af;
            case Register.BC: return this.state.bc;
            case Register.DE: return this.state.de;
            case Register.HL: return this.state.hl;
            case Register.SP: return this.state.sp;
            case Register.PC: return this.state.pc;
            default:
                throw new Error("Forbidden register!");
        }
    }

    private setByteToRegister(register : Register, value : number) {
        
        switch (register) {
            case Register.A: this.state.a = value; break;
            case Register.B: this.state.b = value; break;
            case Register.C: this.state.c = value; break;
            case Register.D: this.state.d = value; break;
            case Register.E: this.state.e = value; break;
            case Register.H: this.state.h = value; break;
            case Register.L: this.state.l = value; break;
            case Register.AF: this.writeByteToMemory(this.state.af, value); break;
            case Register.BC: this.writeByteToMemory(this.state.bc, value); break;
            case Register.DE: this.writeByteToMemory(this.state.de, value); break;
            case Register.HL: this.writeByteToMemory(this.state.hl, value); break;
            case Register.SP: this.writeByteToMemory(this.state.sp, value); break;
            case Register.PC: this.writeByteToMemory(this.state.pc, value); break;
            default: throw new Error("Unknown register!");
        }
    }

    private checkZero(value : number) {
        return value === 0;
    }

    private checkHalfCarry(a : number, b : number, result : number) {
        return (((a ^ b ^ result) & 0x10) === 0x10);
    }

    private checkNegative(value : number) {
        return (value & 0x80) === 0x80;
    }

    public stepCycle() {

        const opcode = new Opcode(this.getNextByte());
        let cycles = this.cycles;

        switch (opcode.value) {
            case 0x00: this.nop(); break;
            case 0x10: this.stop(); break;
            case 0x20: this.jrNZ(); break;
            case 0x30: this.jrNC(); break;
            case 0x01: this.lD_d16(Register.BC); break;
            case 0x11: this.lD_d16(Register.DE); break;
            case 0x21: this.lD_d16(Register.HL); break;
            case 0x31: this.lD_d16(Register.SP); break;
            case 0x02: this.lD_A(Register.BC, Action.None); break;
            case 0x12: this.lD_A(Register.DE, Action.None); break;
            case 0x22: this.lD_A(Register.HL, Action.Increment); break;
            case 0x32: this.lD_A(Register.HL, Action.Decrement); break;
            case 0x03: this.incRegPair(Register.BC); break;
            case 0x13: this.incRegPair(Register.DE); break;
            case 0x23: this.incRegPair(Register.HL); break;
            case 0x33: this.incRegPair(Register.SP); break;
            case 0x04: this.inc(Register.B); break;
            case 0x14: this.inc(Register.D); break;
            case 0x24: this.inc(Register.H); break;
            case 0x34: this.incRef(); break;
            case 0x05: this.dec(Register.B); break;
            case 0x15: this.dec(Register.D); break;
            case 0x25: this.dec(Register.H); break;
            case 0x35: this.decRef(); break;
            case 0x06: this.ld_d8(Register.B); break;
            case 0x16: this.ld_d8(Register.D); break;
            case 0x26: this.ld_d8(Register.H); break;
            case 0x36: this.ld_d8(Register.HL); break;
            case 0x07: this.rlca(); break;
            case 0x17: this.rla(); break;
            case 0x27: this.daa(); break;
            case 0x37: this.scf(); break;
            case 0x08: this.ld_SP(); break;
            case 0x18: this.jr(); break;
            case 0x28: this.jrz(); break;
            case 0x38: this.jrc(); break;
            case 0x09: this.addHL(Register.BC); break;
            case 0x19: this.addHL(Register.DE); break;
            case 0x29: this.addHL(Register.HL); break;
            case 0x39: this.addHL(Register.SP); break;
            case 0x0A: this.ldA(Register.BC, Action.None); break;
            case 0x1A: this.ldA(Register.DE, Action.None); break;
            case 0x2A: this.ldA(Register.HL, Action.Increment); break;
            case 0x3A: this.ldA(Register.HL, Action.Decrement); break;
            case 0x0B: this.decRegPair(Register.BC); break;
            case 0x1B: this.decRegPair(Register.DE); break;
            case 0x2B: this.decRegPair(Register.HL); break;
            case 0x3B: this.decRegPair(Register.SP); break;
            case 0x0C: this.inc(Register.C); break;
            case 0x1C: this.inc(Register.E); break;
            case 0x2C: this.inc(Register.L); break;
            case 0x3C: this.inc(Register.A); break;
            case 0x0D: this.dec(Register.C); break;
            case 0x1D: this.dec(Register.E); break;
            case 0x2D: this.dec(Register.L); break;
            case 0x3D: this.dec(Register.A); break;
            case 0x0E: this.ld_d8(Register.C); break;
            case 0x1E: this.ld_d8(Register.E); break;
            case 0x2E: this.ld_d8(Register.L); break;
            case 0x3E: this.ld_d8(Register.A); break;
            case 0x0F: this.rrca(); break;
            case 0x1F: this.rra(); break;
            case 0x2F: this.cpl(); break;
            case 0x3F: this.ccf(); break;
            case 0x40: this.ld(Register.B, Register.B); break;
            case 0x41: this.ld(Register.B, Register.C); break;
            case 0x42: this.ld(Register.B, Register.D); break;
            case 0x43: this.ld(Register.B, Register.E); break;
            case 0x44: this.ld(Register.B, Register.H); break;
            case 0x45: this.ld(Register.B, Register.L); break;
            case 0x46: this.ld(Register.B, Register.HL); break;
            case 0x47: this.ld(Register.B, Register.A); break;
            case 0x48: this.ld(Register.C, Register.B); break;
            case 0x49: this.ld(Register.C, Register.C); break;
            case 0x4A: this.ld(Register.C, Register.D); break;
            case 0x4B: this.ld(Register.C, Register.E); break;
            case 0x4C: this.ld(Register.C, Register.H); break;
            case 0x4D: this.ld(Register.C, Register.L); break;
            case 0x4E: this.ld(Register.C, Register.HL); break;
            case 0x4F: this.ld(Register.C, Register.A); break;
            case 0x50: this.ld(Register.D, Register.B); break;
            case 0x51: this.ld(Register.D, Register.C); break;
            case 0x52: this.ld(Register.D, Register.D); break;
            case 0x53: this.ld(Register.D, Register.E); break;
            case 0x54: this.ld(Register.D, Register.H); break;
            case 0x55: this.ld(Register.D, Register.L); break;
            case 0x56: this.ld(Register.D, Register.HL); break;
            case 0x57: this.ld(Register.D, Register.A); break;
            case 0x58: this.ld(Register.E, Register.B); break;
            case 0x59: this.ld(Register.E, Register.C); break;
            case 0x5A: this.ld(Register.E, Register.D); break;
            case 0x5B: this.ld(Register.E, Register.E); break;
            case 0x5C: this.ld(Register.E, Register.H); break;
            case 0x5D: this.ld(Register.E, Register.L); break;
            case 0x5E: this.ld(Register.E, Register.HL); break;
            case 0x5F: this.ld(Register.E, Register.A); break;
            case 0x60: this.ld(Register.H, Register.B); break;
            case 0x61: this.ld(Register.H, Register.C); break;
            case 0x62: this.ld(Register.H, Register.D); break;
            case 0x63: this.ld(Register.H, Register.E); break;
            case 0x64: this.ld(Register.H, Register.H); break;
            case 0x65: this.ld(Register.H, Register.L); break;
            case 0x66: this.ld(Register.H, Register.HL); break;
            case 0x67: this.ld(Register.H, Register.A); break;
            case 0x68: this.ld(Register.L, Register.B); break;
            case 0x69: this.ld(Register.L, Register.C); break;
            case 0x6A: this.ld(Register.L, Register.D); break;
            case 0x6B: this.ld(Register.L, Register.E); break;
            case 0x6C: this.ld(Register.L, Register.H); break;
            case 0x6D: this.ld(Register.L, Register.L); break;
            case 0x6E: this.ld(Register.L, Register.HL); break;
            case 0x6F: this.ld(Register.L, Register.A); break;
            case 0x70: this.ld(Register.HL, Register.B); break;
            case 0x71: this.ld(Register.HL, Register.C); break;
            case 0x72: this.ld(Register.HL, Register.D); break;
            case 0x73: this.ld(Register.HL, Register.E); break;
            case 0x74: this.ld(Register.HL, Register.H); break;
            case 0x75: this.ld(Register.HL, Register.L); break;
            case 0x76: this.halt(); break;
            case 0x77: this.ld(Register.HL, Register.A); break;
            case 0x78: this.ld(Register.A, Register.B); break;
            case 0x79: this.ld(Register.A, Register.C); break;
            case 0x7A: this.ld(Register.A, Register.D); break;
            case 0x7B: this.ld(Register.A, Register.E); break;
            case 0x7C: this.ld(Register.A, Register.H); break;
            case 0x7D: this.ld(Register.A, Register.L); break;
            case 0x7E: this.ld(Register.A, Register.HL); break;
            case 0x7F: this.ld(Register.A, Register.A); break;
            case 0x80: this.add(Register.B);  break;
            case 0x81: this.add(Register.C);  break;
            case 0x82: this.add(Register.D);  break;
            case 0x83: this.add(Register.E);  break;
            case 0x84: this.add(Register.H);  break;
            case 0x85: this.add(Register.L);  break;
            case 0x86: this.add(Register.HL); break;
            case 0x87: this.add(Register.A);  break;
            case 0x88: this.adc(Register.B); break;
            case 0x89: this.adc(Register.C); break;
            case 0x8A: this.adc(Register.D); break;
            case 0x8B: this.adc(Register.E); break;
            case 0x8C: this.adc(Register.H); break;
            case 0x8D: this.adc(Register.L); break;
            case 0x8E: this.adc(Register.HL);break;
            case 0x8F: this.adc(Register.A); break;
            case 0x90: this.sub(Register.B); break;
            case 0x91: this.sub(Register.C); break;
            case 0x92: this.sub(Register.D); break;
            case 0x93: this.sub(Register.E); break;
            case 0x94: this.sub(Register.H); break;
            case 0x95: this.sub(Register.L); break;
            case 0x96: this.sub(Register.HL);break;
            case 0x97: this.sub(Register.A); break;
            case 0x98: this.sbc(Register.B); break;
            case 0x99: this.sbc(Register.C); break;
            case 0x9A: this.sbc(Register.D); break;
            case 0x9B: this.sbc(Register.E); break;
            case 0x9C: this.sbc(Register.H); break;
            case 0x9D: this.sbc(Register.L); break;
            case 0x9E: this.sbc(Register.HL);break;
            case 0x9F: this.sbc(Register.A); break;
            case 0xA0: this.and(Register.B); break;
            case 0xA1: this.and(Register.C); break;
            case 0xA2: this.and(Register.D); break;
            case 0xA3: this.and(Register.E); break;
            case 0xA4: this.and(Register.H); break;
            case 0xA5: this.and(Register.L); break;
            case 0xA6: this.and(Register.HL);break;
            case 0xA7: this.and(Register.A); break;
            case 0xA8: this.xor(Register.B); break;
            case 0xA9: this.xor(Register.C); break;
            case 0xAA: this.xor(Register.D); break;
            case 0xAB: this.xor(Register.E); break;
            case 0xAC: this.xor(Register.H); break;
            case 0xAD: this.xor(Register.L); break;
            case 0xAE: this.xor(Register.HL);break;
            case 0xAF: this.xor(Register.A); break;
            case 0xB0: this.or(Register.B); break;
            case 0xB1: this.or(Register.C); break;
            case 0xB2: this.or(Register.D); break;
            case 0xB3: this.or(Register.E); break;
            case 0xB4: this.or(Register.H); break;
            case 0xB5: this.or(Register.L); break;
            case 0xB6: this.or(Register.HL);break;
            case 0xB7: this.or(Register.A); break;
            case 0xB8: this.cp(Register.B); break;
            case 0xB9: this.cp(Register.C); break;
            case 0xBA: this.cp(Register.D); break;
            case 0xBB: this.cp(Register.E); break;
            case 0xBC: this.cp(Register.H); break;
            case 0xBD: this.cp(Register.L); break;
            case 0xBE: this.cp(Register.HL);break;
            case 0xBF: this.cp(Register.A); break;
            case 0xC0: this.retNZ(); break;
            case 0xD0: this.retNC(); break;
            case 0xE0: this.ldh_a8_A(); break;
            case 0xF0: this.ldh_A_a8(); break;
            case 0xC1: this.pop(Register.BC); break;
            case 0xD1: this.pop(Register.DE); break;
            case 0xE1: this.pop(Register.HL); break;
            case 0xF1: this.popPsw(); break;
            case 0xC2: this.jpNZ(); break;
            case 0xD2: this.jpNC(); break;
            case 0xE2: this.ld_C_A(); break;
            case 0xF2: this.ld_A_C(); break;
            case 0xC3: this.jp(); break;
            case 0xD3: break;
            case 0xE3: break;
            case 0xF3: this.di(); break;
            case 0xC4: this.callNZ(); break;
            case 0xD4: this.callNC(); break;
            case 0xE4: break;
            case 0xF4: break;
            case 0xC5: this.push(Register.BC); break;
            case 0xD5: this.push(Register.DE); break;
            case 0xE5: this.push(Register.HL); break;
            case 0xF5: this.push(Register.AF); break;
            case 0xC6: this.add_A_d8(); break;
            case 0xD6: this.sub_d8(); break;
            case 0xE6: this.and_d8(); break;
            case 0xF6: this.or_d8(); break;
            case 0xC7: this.rst((this.rstOffset + 0x00) & 0xFFFF); break;
            case 0xD7: this.rst((this.rstOffset + 0x10) & 0xFFFF); break;
            case 0xE7: this.rst((this.rstOffset + 0x20) & 0xFFFF); break;
            case 0xF7: this.rst((this.rstOffset + 0x30) & 0xFFFF); break;
            case 0xC8: this.retZ(); break;
            case 0xD8: this.retC(); break;
            case 0xE8: this.addSP(); break;
            case 0xF8: this.ld_HL_SPr8(); break;
            case 0xC9: this.ret(); break;
            case 0xD9: this.reti(); break;
            case 0xE9: this.jp_HL(); break;
            case 0xF9: this.ld_SPHL(); break;
            case 0xCA: this.jpZ(); break;
            case 0xDA: this.jpC(); break;
            case 0xEA: this.ld_a16_A(); break;
            case 0xFA: this.ld_A_a16(); break;
            case 0xCB: this.cb(); break;
            case 0xDB: break;
            case 0xEB: break;
            case 0xFB: this.ei(); break;
            case 0xCC: this.callZ(); break;
            case 0xDC: this.callC(); break;
            case 0xEC: break;
            case 0xFC: break;
            case 0xCD: this.call(); break;
            case 0xDD: break;
            case 0xED: break;
            case 0xFD: break;
            case 0xCE: this.adcImp(); break;
            case 0xDE: this.sbcImp(); break;
            case 0xEE: this.xorImp(); break;
            case 0xFE: this.cpImp(); break;
            case 0xCF: this.rst((this.rstOffset + 0x08) & 0xFFFF); break;
            case 0xDF: this.rst((this.rstOffset + 0x18) & 0xFFFF); break;
            case 0xEF: this.rst((this.rstOffset + 0x28) & 0xFFFF); break;
            case 0xFF: this.rst((this.rstOffset + 0x38) & 0xFFFF); break;
        }
    
        opcode.cyclesTaken = this.cycles - cycles;

        return opcode;
    }

    //#region Main opcodes

    private adcImp() {
        const value = this.getNextByte();
        let result = this.state.a + value;

        if (this.state.flags.carry)
            result++;

        this.state.flags.carry = (result & 0x100) == 0x100; 
        this.state.flags.halfCarry = this.checkHalfCarry(this.state.a, value, result & 0xFF);
        this.state.a = result & 0xFF;
        this.state.flags.zero = this.checkZero(this.state.a);
        this.state.flags.subtract = false;
        
        this.cycles += 8;
    }

    private sbcImp() {
        const value = this.getNextByte();
        let result = this.state.a - value;

        if (this.state.flags.carry)
            result--;

        this.state.flags.carry = result < 0;
        this.state.flags.halfCarry = this.checkHalfCarry(this.state.a, value, result & 0xFF); 
        this.state.a = result & 0xFF;
        this.state.flags.subtract = true;
        this.state.flags.zero = this.checkZero(this.state.a);

        this.cycles += 8;
    }

    private xorImp() {
        const value = this.getNextByte();
        this.state.flags.carry = false;
        this.state.a ^= value;
        this.state.flags.zero = this.checkZero(this.state.a);
        this.state.flags.subtract = false;
        this.state.flags.halfCarry = false;
        
        this.cycles += 8;
    }

    private cpImp() {
        const value = this.getNextByte();                
        const result = (this.state.a - value) & 0xFF;
        this.state.flags.carry = value > this.state.a;
        this.state.flags.zero = this.checkZero(result);
        this.state.flags.subtract = true;
        this.state.flags.halfCarry = this.checkHalfCarry(this.state.a, value, result);
        
        this.cycles += 8;
    }

    private nop() {
        this.cycles += 4;
    }

    private stop() {
        const value = this.getNextByte();

        if (value !== 0)
            this.state.halted = true;

        this.cycles += 4;
    }

    private conditionalJr(condition: boolean) {
        if (condition)
            this.jr();
        else {
            this.getNextByte();
            this.cycles += 8;
        }
    }

    private jrNZ() {
        this.conditionalJr(!this.state.flags.zero);
    }

    private jrNC() {
        this.conditionalJr(!this.state.flags.carry);
    }

    private lD_d16(register: Register) {
        switch (register) {
            case Register.BC:
                this.state.c = this.mmu.get(this.state.pc++);
                this.state.b = this.mmu.get(this.state.pc++);
                break;
            case Register.DE:
                this.state.e = this.mmu.get(this.state.pc++);
                this.state.d = this.mmu.get(this.state.pc++);
                break;
            case Register.HL:
                this.state.l = this.mmu.get(this.state.pc++);
                this.state.h = this.mmu.get(this.state.pc++);
                break;
            case Register.SP:
                this.state.sp = LittleEndian.getWordFrom2Bytes(
                    this.mmu.get(this.state.pc++), this.mmu.get(this.state.pc++));
                break;
        }
        
        this.cycles += 12;
    }

    private lD_A(register: Register, action: Action) {

        if (register === Register.BC)
            this.mmu.set(this.state.bc, this.state.a);
        else if (register === Register.DE)
            this.mmu.set(this.state.de, this.state.a);
        else if (register === Register.HL)
            this.mmu.set(this.state.hl, this.state.a);

        if (action === Action.Increment)
            this.state.hl++;
        else if (action === Action.Decrement)
            this.state.hl--;

        this.state.hl &= 0xFFFF;

        this.cycles += 8;
    }

    private incRegPair(register: Register) {
        switch (register) {
            case Register.BC: 
                this.state.bc++; 
                this.state.bc &= 0xFFFF; 
                break;
            case Register.DE: 
                this.state.de++; 
                this.state.de &= 0xFFFF; 
                break;
            case Register.HL: 
                this.state.hl++; 
                this.state.hl &= 0xFFFF; 
                break;
            case Register.SP: 
                this.state.sp++; 
                this.state.sp &= 0xFFFF; 
                break;
        }
    }

    private inc(register: Register) {
        let regValue : number;

        switch (register) {
            case Register.A: 
                regValue = this.state.a;
                this.state.a++; 
                this.state.a &= 0xFF;
                this.state.flags.zero = this.checkZero(this.state.a);
                this.state.flags.halfCarry = this.checkHalfCarry(regValue, 1, this.state.a);
                break;
            case Register.B: 
                regValue = this.state.b;
                this.state.b++; 
                this.state.b &= 0xFF;
                this.state.flags.zero = this.checkZero(this.state.b);
                this.state.flags.halfCarry = this.checkHalfCarry(regValue, 1, this.state.b);
                break;
            case Register.C: 
                regValue = this.state.c;
                this.state.c++; 
                this.state.c &= 0xFF;
                this.state.flags.zero = this.checkZero(this.state.c);
                this.state.flags.halfCarry = this.checkHalfCarry(regValue, 1, this.state.c);
                break;
            case Register.D: 
                regValue = this.state.d;
                this.state.d++; 
                this.state.d &= 0xFF;
                this.state.flags.zero = this.checkZero(this.state.d);
                this.state.flags.halfCarry = this.checkHalfCarry(regValue, 1, this.state.d);
                break;
            case Register.E: 
                regValue = this.state.e;
                this.state.e++; 
                this.state.e &= 0xFF;
                this.state.flags.zero = this.checkZero(this.state.e);
                this.state.flags.halfCarry = this.checkHalfCarry(regValue, 1, this.state.e);
                break;
            case Register.H: 
                regValue = this.state.h;
                this.state.h++; 
                this.state.h &= 0xFF;
                this.state.flags.zero = this.checkZero(this.state.h);
                this.state.flags.halfCarry = this.checkHalfCarry(regValue, 1, this.state.h);
                break;
            case Register.L: 
                regValue = this.state.l;
                this.state.l++; 
                this.state.l &= 0xFF;
                this.state.flags.zero = this.checkZero(this.state.l);
                this.state.flags.halfCarry = this.checkHalfCarry(regValue, 1, this.state.l);
                break;
        }

        this.state.flags.subtract = false;
        this.cycles += 4;
    }

    private incRef() {
        const reference = this.mmu.get(this.state.hl);
        this.mmu.set(this.state.hl, (this.mmu.get(this.state.hl) + 1) & 0xFF);
        
        this.state.flags.zero = this.checkZero(this.mmu.get(this.state.hl));
        this.state.flags.halfCarry = this.checkHalfCarry(reference, 1, this.mmu.get(this.state.hl));
        this.state.flags.subtract = false;

        this.cycles += 12;
    }

    private dec(register: Register) {
        let regValue : number;

        switch (register) {
            case Register.A: 
                regValue = this.state.a;
                this.state.a--; 
                this.state.a &= 0xFF;
                this.state.flags.zero = this.checkZero(this.state.a);
                this.state.flags.halfCarry = this.checkHalfCarry(regValue, 1, this.state.a);
                break;
            case Register.B: 
                regValue = this.state.b;
                this.state.b--; 
                this.state.b &= 0xFF;
                this.state.flags.zero = this.checkZero(this.state.b);
                this.state.flags.halfCarry = this.checkHalfCarry(regValue, 1, this.state.b);
                break;
            case Register.C: 
                regValue = this.state.c;
                this.state.c--; 
                this.state.c &= 0xFF;
                this.state.flags.zero = this.checkZero(this.state.c);
                this.state.flags.halfCarry = this.checkHalfCarry(regValue, 1, this.state.c);
                break;
            case Register.D: 
                regValue = this.state.d;
                this.state.d--; 
                this.state.d &= 0xFF;
                this.state.flags.zero = this.checkZero(this.state.d);
                this.state.flags.halfCarry = this.checkHalfCarry(regValue, 1, this.state.d);
                break;
            case Register.E: 
                regValue = this.state.e;
                this.state.e--; 
                this.state.e &= 0xFF;
                this.state.flags.zero = this.checkZero(this.state.e);
                this.state.flags.halfCarry = this.checkHalfCarry(regValue, 1, this.state.e);
                break;
            case Register.H: 
                regValue = this.state.h;
                this.state.h--; 
                this.state.h &= 0xFF;
                this.state.flags.zero = this.checkZero(this.state.h);
                this.state.flags.halfCarry = this.checkHalfCarry(regValue, 1, this.state.h);
                break;
            case Register.L: 
                regValue = this.state.l;
                this.state.l--; 
                this.state.l &= 0xFF;
                this.state.flags.zero = this.checkZero(this.state.l);
                this.state.flags.halfCarry = this.checkHalfCarry(regValue, 1, this.state.l);
                break;
        }

        this.state.flags.subtract = true;
        this.cycles += 4;
    }

    private decRef() {

        const reference = this.mmu.get(this.state.hl);
        this.mmu.set(this.state.hl, (this.mmu.get(this.state.hl) - 1) & 0xFF);
        
        this.state.flags.zero = this.checkZero(this.mmu.get(this.state.hl));
        this.state.flags.halfCarry = this.checkHalfCarry(reference, 1, this.mmu.get(this.state.hl));
        this.state.flags.subtract = true;

        this.cycles += 12;
    }

    private ld_d8(register: Register) {
        switch (register) {
            case Register.A: this.state.a = this.getNextByte(); break;
            case Register.B: this.state.b = this.getNextByte(); break;
            case Register.C: this.state.c = this.getNextByte(); break;
            case Register.D: this.state.d = this.getNextByte(); break;
            case Register.E: this.state.e = this.getNextByte(); break;
            case Register.H: this.state.h = this.getNextByte(); break;
            case Register.L: this.state.l = this.getNextByte(); break;
            case Register.HL: 
                this.writeByteToMemory(this.state.hl, this.getNextByte()); 
                this.cycles += 4;
                break;
        }

        this.cycles += 8;
    }

    private rlca() {
        this.state.flags.carry = ((this.state.a & 0x80) >> 7) == 1;
        this.state.a <<= 1;

        if (this.state.flags.carry)
            this.state.a |= 1;

        this.state.a &= 0xFF;

        this.state.flags.zero = false;
        this.state.flags.subtract = false;
        this.state.flags.halfCarry = false;

        this.cycles += 4;
    }

    private rla() {
        const previousCarry = this.state.flags.carry;
        this.state.flags.carry = ((this.state.a & 0x80) >> 7) == 1;
        this.state.a <<= 1;

        if (previousCarry)
            this.state.a |= 1;

        this.state.a &= 0xFF;

        this.state.flags.zero = false;
        this.state.flags.subtract = false;
        this.state.flags.halfCarry = false;

        this.cycles += 4;
    }

    private daa() {
        
        if (!this.state.flags.subtract) {
            if (this.state.flags.carry || this.state.a > 0x99)  { 
                this.state.a += 0x60; 
                this.state.flags.carry = true; 
            }

            if (this.state.flags.halfCarry || (this.state.a & 0x0f) > 0x09) 
                this.state.a += 0x6; 
        } else {
            if (this.state.flags.carry) 
                this.state.a -= 0x60; 

            if (this.state.flags.halfCarry) 
                this.state.a -= 0x6; 
        }

        this.state.a &= 0xFF;

        this.state.flags.zero = this.checkZero(this.state.a);
        this.state.flags.halfCarry = false;

        this.cycles += 4;
    }

    private scf() {
        this.state.flags.carry = true;
        this.state.flags.halfCarry = false;
        this.state.flags.subtract = false;
        this.cycles += 4;       
    }

    private ld_SP() {
        let addr = this.getNextWord();
        const [msb, lsb] = LittleEndian.get2BytesFromWord(this.state.sp);
        this.mmu.set(addr++, lsb);
        this.mmu.set(addr++, msb);

        this.cycles += 20;
    }

    private jr() {
        const value = Byte.toSignedByte(this.getNextByte());
        const result = this.state.pc + value;
        this.state.pc = result & 0xFFFF;
        this.cycles += 12;
    }

    private jrz() {
        this.conditionalJr(this.state.flags.zero);
    }

    private jrc() {
        this.conditionalJr(this.state.flags.carry);
    }

    private addHL(register: Register) {
        const word = this.getWordFromRegister(register);
        const result = (this.state.hl + word);
        this.state.flags.carry = (((this.state.hl ^ word ^ result) & 0x10000) === 0x10000);
        this.state.flags.subtract = false;
        this.state.flags.halfCarry = (((this.state.hl ^ word ^ result) & 0x1000) === 0x1000);
        this.state.hl += word;
        this.state.hl &= 0xFFFF;
        
        this.cycles += 8;
    }

    private ldA(register: Register, action: Action) {
        
        const value = this.getByteFromRegister(register);
        this.state.a = value;

        if (action === Action.Increment)
            this.state.hl++;
        else if (action === Action.Decrement)
            this.state.hl--;

        this.state.hl &= 0xFFFF;

        this.cycles += 8;
    }

    private decRegPair(register: Register) {
        switch (register) {
            case Register.BC: 
                this.state.bc--; 
                this.state.bc &= 0xFFFF; 
                break;
            case Register.DE: 
                this.state.de--; 
                this.state.de &= 0xFFFF; 
                break;
            case Register.HL: 
                this.state.hl--; 
                this.state.hl &= 0xFFFF; 
                break;
            case Register.SP: 
                this.state.sp--; 
                this.state.sp &= 0xFFFF; 
                break;
        }
    }

    private rrca() {
        this.state.flags.carry = (this.state.a & 0x1) === 1;
        this.state.a >>= 1;

        if (this.state.flags.carry)
            this.state.a |= 0x80;

        this.state.flags.zero = false;
        this.state.flags.subtract = false;
        this.state.flags.halfCarry = false;

        this.cycles += 4;
    }

    private rra() {
        const previousCarry = this.state.flags.carry;
        this.state.flags.carry = (this.state.a & 0x1) === 1;
        this.state.a >>= 1;

        if (previousCarry)
            this.state.a |= 0x80;

        this.state.flags.zero = false;
        this.state.flags.subtract = false;
        this.state.flags.halfCarry = false;

        this.cycles += 4;
    }

    private cpl() {
        this.state.a = ~this.state.a & 0xFF;
        this.state.flags.subtract = true;
        this.state.flags.halfCarry = true;
        
        this.cycles += 4;
    }

    private ccf() {
        this.state.flags.carry = !this.state.flags.carry;
        this.state.flags.halfCarry = false;
        this.state.flags.subtract = false;

        this.cycles += 4;
    }

    private ld(registerA: Register, registerB: Register) {
        const value = this.getByteFromRegister(registerB);

        if (registerB === Register.HL)
            this.cycles += 4;

        switch (registerA) {
            case Register.A: this.state.a = value; break;
            case Register.B: this.state.b = value; break;
            case Register.C: this.state.c = value; break;
            case Register.D: this.state.d = value; break;
            case Register.E: this.state.e = value; break;
            case Register.H: this.state.h = value; break;
            case Register.L: this.state.l = value; break;
            case Register.HL: this.writeByteToMemory(this.state.hl, value); break;
        }

        this.cycles += 4;
    }

    private halt() {
        this.state.halted = true;
        this.cycles += 4;
    }

    private add(register: Register) {
        const value = this.getByteFromRegister(register);

        if (register === Register.HL)
            this.cycles += 4;

        const result = this.state.a + value;

        this.state.flags.subtract = false;
        this.state.flags.carry = (result & 0x100) === 0x100; 
        this.state.flags.halfCarry = this.checkHalfCarry(this.state.a, value, result & 0xFF);
        this.state.a = result & 0xFF;
        this.state.flags.zero = this.checkZero(this.state.a);
        
        this.cycles += 4;
    }

    private adc(register: Register) {
        const value = this.getByteFromRegister(register);

        if (register === Register.HL)
            this.cycles += 4;

        let result = this.state.a + value;

        if (this.state.flags.carry)
            result++;

        this.state.flags.carry = (result & 0x100) === 0x100; 
        this.state.flags.halfCarry = this.checkHalfCarry(this.state.a, value, result & 0xFF);
        this.state.a = result & 0xFF;
        this.state.flags.zero = this.checkZero(this.state.a);
        this.state.flags.subtract = false;

        this.cycles += 4;
    }

    private sub(register: Register) {
        const value = this.getByteFromRegister(register);

        if (register === Register.HL)
            this.cycles += 4;

        const result = this.state.a - value;
        this.state.flags.carry = result < 0;
        this.state.flags.halfCarry = this.checkHalfCarry(this.state.a, value, result & 0xFF);
        this.state.a = result & 0xFF;
        this.state.flags.zero = this.checkZero(this.state.a);
        this.state.flags.subtract = true;

        this.cycles += 4;
    }

    private sbc(register: Register) {
        const value = this.getByteFromRegister(register);

        if (register === Register.HL)
            this.cycles += 4;

        let result = this.state.a - value;

        if (this.state.flags.carry)
            result--;

        this.state.flags.carry = result < 0;
        this.state.flags.halfCarry = this.checkHalfCarry(this.state.a, value, result & 0xFF);
        this.state.a = result & 0xFF;
        this.state.flags.zero = this.checkZero(this.state.a);
        this.state.flags.subtract = true;

        this.cycles += 4;
    }

    private and(register: Register) {
        const value = this.getByteFromRegister(register);

        if (register === Register.HL)
            this.cycles += 4;

        this.state.flags.carry = false;
        this.state.a &= value;
        this.state.flags.zero = this.checkZero(this.state.a);
        this.state.flags.halfCarry = true;
        this.state.flags.subtract = false;

        this.cycles += 4;
    }

    private xor(register: Register) {
        const value = this.getByteFromRegister(register);

        if (register === Register.HL)
            this.cycles += 4;

        this.state.flags.carry = false;
        this.state.a ^= value;
        this.state.flags.zero = this.checkZero(this.state.a);
        this.state.flags.halfCarry = false;
        this.state.flags.subtract = false;

        this.cycles += 4;
    }

    private or(register: Register) {
        const value = this.getByteFromRegister(register);

        if (register === Register.HL)
            this.cycles += 4;

        this.state.flags.carry = false;
        this.state.a |= value;
        this.state.flags.zero = this.checkZero(this.state.a);
        this.state.flags.halfCarry = false;
        this.state.flags.subtract = false;

        this.cycles += 4;
    }

    private cp(register: Register) {
        const value = this.getByteFromRegister(register);

        if (register === Register.HL)
            this.cycles += 4;

        const result = this.state.a - value;
        this.state.flags.carry = result < 0;
        this.state.flags.zero = this.checkZero(result & 0xFF);
        this.state.flags.subtract = true;
        this.state.flags.halfCarry = this.checkHalfCarry(this.state.a, value, result & 0xFF);

        this.cycles += 4;
    }

    private conditionalRet(condition : boolean)
    {
        if (condition) {
            this.ret();
            this.cycles += 4;
        }
        else
            this.cycles += 8;
    }

    private retNZ() {
        this.conditionalRet(!this.state.flags.zero);
    }

    private retNC() {
        this.conditionalRet(!this.state.flags.carry);
    }

    private ldh_a8_A() {
        this.mmu.set(0xFF00 | this.getNextByte(), this.state.a);
        this.cycles += 12;
    }

    private ldh_A_a8() {
        this.state.a = this.mmu.get(0xFF00 | this.getNextByte());
        this.cycles += 12;
    }

    private pop(register: Register) {
        switch (register) {
            case Register.BC: this.state.bc = this.popStack(); break;
            case Register.DE: this.state.de = this.popStack(); break;
            case Register.HL: this.state.hl = this.popStack(); break;
        }

        this.cycles += 12;
    }

    private popPsw() {
        const af = this.popStack();
        this.state.a = (af >> 8) & 0xFF;
        const psw = (af & 0xFF) & 0xFF;
        
        this.state.flags.zero = ((psw >> 7) & 1) === 1;
        this.state.flags.subtract = ((psw >> 6) & 1) === 1;
        this.state.flags.halfCarry = ((psw >> 5) & 1) === 1;
        this.state.flags.carry = ((psw >> 4) & 1) === 1;

        this.cycles += 10;
    }

    private conditionalJp(condition: boolean) {
        if (condition)
            this.jp();
        else {
            this.getNextWord();
            this.cycles += 12;
        }
    }

    private jpNZ() {
        this.conditionalJp(!this.state.flags.zero);
    }

    private jpNC() {
        this.conditionalJp(!this.state.flags.carry);
    }

    private ld_C_A() {
        this.mmu.set(0xFF00 + this.state.c, this.state.a);
        this.cycles += 8;
    }

    private ld_A_C() {
        this.state.a = this.mmu.get(0xFF00 + this.state.c);
        this.cycles += 8;
    }

    private jp() {
        const addr = this.getNextWord();
        this.state.pc = addr;
        this.cycles += 16;
    }

    private jpAddr(addr : number) {
        this.state.pc = addr;
        this.cycles += 10;
    }

    private di() {
        this.state.enableInterrupts = false;
        this.cycles += 4;
    }

    private conditionalCall(condition: boolean) {
        if (condition)
            this.call();
        else {
            this.getNextWord();
            this.cycles += 12;
        }
    }

    private callNZ() {
        this.conditionalCall(!this.state.flags.zero);
    }

    private callNC() {
        this.conditionalCall(!this.state.flags.carry);
    }

    private push(register: Register) {
        switch (register) {
            case Register.BC: this.pushStack(this.state.bc); break;
            case Register.DE: this.pushStack(this.state.de); break;
            case Register.HL: this.pushStack(this.state.hl); break;
            case Register.AF: this.pushStack(this.state.af); break;
        }

        this.cycles += 16;
    }

    private add_A_d8() {
        const value = this.getNextByte();
        const result = this.state.a + value;

        this.state.flags.carry = (result & 0x100) == 0x100; 
        this.state.flags.halfCarry = this.checkHalfCarry(this.state.a, value, result & 0xFF);
        this.state.a = result & 0xFF;
        this.state.flags.zero = this.checkZero(this.state.a);
        this.state.flags.subtract = false;

        this.cycles += 8;
    }

    private sub_d8() {
        const value = this.getNextByte();
        const result = this.state.a - value;

        this.state.flags.carry = result < 0;
        this.state.flags.halfCarry = this.checkHalfCarry(this.state.a, value, result & 0xFF);
        this.state.a = result & 0xFF;
        this.state.flags.zero = this.checkZero(this.state.a);
        this.state.flags.subtract = true;
        
        this.cycles += 8;
    }

    private and_d8() {
        const value = this.getNextByte();
        this.state.flags.carry = false;
        this.state.flags.halfCarry = true;
        this.state.flags.subtract = false;
        this.state.a &= value;
        this.state.flags.zero = this.checkZero(this.state.a);
        
        this.cycles += 8;
    }

    private or_d8() {
        const value = this.getNextByte();
        this.state.flags.carry = false;
        this.state.flags.halfCarry = false;
        this.state.flags.subtract = false;
        this.state.a |= value;
        this.state.flags.zero = this.checkZero(this.state.a);
        
        this.cycles += 8;
    }

    private rst(addr: number) {
        this.callAddr(addr);
        this.cycles += 8;
    }

    private retZ() {
        this.conditionalRet(this.state.flags.zero);
    }

    private retC() {
        this.conditionalRet(this.state.flags.carry);
    }

    private addSP() {
        const value = Byte.toSignedByte(this.getNextByte());
        const sp = this.state.sp;
        this.state.sp = (sp + value) & 0xFFFF;

        this.state.flags.zero = false;
        this.state.flags.subtract = false;
        this.state.flags.carry = (((sp ^ value ^ this.state.sp) & 0x100) === 0x100); 
        this.state.flags.halfCarry = this.checkHalfCarry(sp, value & 0xFFFF, this.state.sp);
        
        this.cycles += 16;
    }

    private ld_HL_SPr8() {

        const value = Byte.toSignedByte(this.getNextByte());
        const sp = this.state.sp;
        this.state.hl = (sp + value) & 0xFFFF;

        this.state.flags.zero = false;
        this.state.flags.subtract = false;
        this.state.flags.carry = (((sp ^ value ^ this.state.hl) & 0x100) === 0x100); 
        this.state.flags.halfCarry = this.checkHalfCarry(sp, value & 0xFFFF, this.state.hl);
        
        this.cycles += 12;        
    }

    private ret() {
        this.state.pc = this.popStack();
        this.cycles += 16;
    }

    private reti() {
        this.ret();
        this.state.enableInterrupts = true;
    }

    private jp_HL() {
        this.jpAddr(this.state.hl);
        this.cycles += 4;
    }

    private ld_SPHL() {
        this.state.sp = this.state.hl;
        this.cycles += 8;
    }

    private jpZ() {
        this.conditionalJp(this.state.flags.zero);
    }

    private jpC() {
        this.conditionalJp(this.state.flags.carry);
    }

    private ld_a16_A() {
        this.mmu.set(this.getNextWord(), this.state.a);
        this.cycles += 16;
    }

    private ld_A_a16() {
        this.state.a = this.mmu.get(this.getNextWord());
        this.cycles += 16;
    }

    private ei() {
        this.state.enableInterrupts = true;
        this.cycles += 4;   
    }

    private callZ() {
        this.conditionalCall(this.state.flags.zero);
    }

    private callC() {
        this.conditionalCall(this.state.flags.carry);
    }

    private call() {
        const addr = this.getNextWord();
        this.pushStack(this.state.pc);
        this.jpAddr(addr);
        this.cycles += 14;
    }

    private callAddr(addr : number) {
        this.pushStack(this.state.pc);
        this.jpAddr(addr);
    }

    //#endregion

    //#region Prefix CB

    private cb() {

        switch (this.getNextByte()) {

            case 0x00: this.rlc(Register.B); break;
            case 0x01: this.rlc(Register.C); break;
            case 0x02: this.rlc(Register.D); break;
            case 0x03: this.rlc(Register.E); break;
            case 0x04: this.rlc(Register.H); break;
            case 0x05: this.rlc(Register.L); break;
            case 0x06: this.rlc(Register.HL); break;
            case 0x07: this.rlc(Register.A); break;
            case 0x08: this.rrc(Register.B); break;
            case 0x09: this.rrc(Register.C); break;
            case 0x0A: this.rrc(Register.D); break;
            case 0x0B: this.rrc(Register.E); break;
            case 0x0C: this.rrc(Register.H); break;
            case 0x0D: this.rrc(Register.L); break;
            case 0x0E: this.rrc(Register.HL); break;
            case 0x0F: this.rrc(Register.A); break;
            case 0x10: this.rl(Register.B); break;
            case 0x11: this.rl(Register.C); break;
            case 0x12: this.rl(Register.D); break;
            case 0x13: this.rl(Register.E); break;
            case 0x14: this.rl(Register.H); break;
            case 0x15: this.rl(Register.L); break;
            case 0x16: this.rl(Register.HL); break;
            case 0x17: this.rl(Register.A); break;
            case 0x18: this.rr(Register.B); break;
            case 0x19: this.rr(Register.C); break;
            case 0x1A: this.rr(Register.D); break;
            case 0x1B: this.rr(Register.E); break;
            case 0x1C: this.rr(Register.H); break;
            case 0x1D: this.rr(Register.L); break;
            case 0x1E: this.rr(Register.HL); break;
            case 0x1F: this.rr(Register.A); break;
            case 0x20: this.sla(Register.B); break;
            case 0x21: this.sla(Register.C); break;
            case 0x22: this.sla(Register.D); break;
            case 0x23: this.sla(Register.E); break;
            case 0x24: this.sla(Register.H); break;
            case 0x25: this.sla(Register.L); break;
            case 0x26: this.sla(Register.HL); break;
            case 0x27: this.sla(Register.A); break;
            case 0x28: this.sra(Register.B); break;
            case 0x29: this.sra(Register.C); break;
            case 0x2A: this.sra(Register.D); break;
            case 0x2B: this.sra(Register.E); break;
            case 0x2C: this.sra(Register.H); break;
            case 0x2D: this.sra(Register.L); break;
            case 0x2E: this.sra(Register.HL); break;
            case 0x2F: this.sra(Register.A); break;
            case 0x30: this.swap(Register.B); break;
            case 0x31: this.swap(Register.C); break;
            case 0x32: this.swap(Register.D); break;
            case 0x33: this.swap(Register.E); break;
            case 0x34: this.swap(Register.H); break;
            case 0x35: this.swap(Register.L); break;
            case 0x36: this.swap(Register.HL); break;
            case 0x37: this.swap(Register.A); break;
            case 0x38: this.srl(Register.B); break;
            case 0x39: this.srl(Register.C); break;
            case 0x3A: this.srl(Register.D); break;
            case 0x3B: this.srl(Register.E); break;
            case 0x3C: this.srl(Register.H); break;
            case 0x3D: this.srl(Register.L); break;
            case 0x3E: this.srl(Register.HL); break;
            case 0x3F: this.srl(Register.A); break;
            case 0x40: this.bit(0, Register.B);  break;
            case 0x41: this.bit(0, Register.C);  break;
            case 0x42: this.bit(0, Register.D);  break;
            case 0x43: this.bit(0, Register.E);  break;
            case 0x44: this.bit(0, Register.H);  break;
            case 0x45: this.bit(0, Register.L);  break;
            case 0x46: this.bit(0, Register.HL); break;
            case 0x47: this.bit(0, Register.A);  break;
            case 0x48: this.bit(1, Register.B);  break;
            case 0x49: this.bit(1, Register.C);  break;
            case 0x4A: this.bit(1, Register.D);  break;
            case 0x4B: this.bit(1, Register.E);  break;
            case 0x4C: this.bit(1, Register.H);  break;
            case 0x4D: this.bit(1, Register.L);  break;
            case 0x4E: this.bit(1, Register.HL); break;
            case 0x4F: this.bit(1, Register.A);  break;
            case 0x50: this.bit(2, Register.B);  break;
            case 0x51: this.bit(2, Register.C);  break;
            case 0x52: this.bit(2, Register.D);  break;
            case 0x53: this.bit(2, Register.E);  break;
            case 0x54: this.bit(2, Register.H);  break;
            case 0x55: this.bit(2, Register.L);  break;
            case 0x56: this.bit(2, Register.HL); break;
            case 0x57: this.bit(2, Register.A);  break;
            case 0x58: this.bit(3, Register.B);  break;
            case 0x59: this.bit(3, Register.C);  break;
            case 0x5A: this.bit(3, Register.D);  break;
            case 0x5B: this.bit(3, Register.E);  break;
            case 0x5C: this.bit(3, Register.H);  break;
            case 0x5D: this.bit(3, Register.L);  break;
            case 0x5E: this.bit(3, Register.HL); break;
            case 0x5F: this.bit(3, Register.A);  break;
            case 0x60: this.bit(4, Register.B);  break;
            case 0x61: this.bit(4, Register.C);  break;
            case 0x62: this.bit(4, Register.D);  break;
            case 0x63: this.bit(4, Register.E);  break;
            case 0x64: this.bit(4, Register.H);  break;
            case 0x65: this.bit(4, Register.L);  break;
            case 0x66: this.bit(4, Register.HL); break;
            case 0x67: this.bit(4, Register.A);  break;
            case 0x68: this.bit(5, Register.B);  break;
            case 0x69: this.bit(5, Register.C);  break;
            case 0x6A: this.bit(5, Register.D);  break;
            case 0x6B: this.bit(5, Register.E);  break;
            case 0x6C: this.bit(5, Register.H);  break;
            case 0x6D: this.bit(5, Register.L);  break;
            case 0x6E: this.bit(5, Register.HL); break;
            case 0x6F: this.bit(5, Register.A);  break;
            case 0x70: this.bit(6, Register.B);  break;
            case 0x71: this.bit(6, Register.C);  break;
            case 0x72: this.bit(6, Register.D);  break;
            case 0x73: this.bit(6, Register.E);  break;
            case 0x74: this.bit(6, Register.H);  break;
            case 0x75: this.bit(6, Register.L);  break;
            case 0x76: this.bit(6, Register.HL); break;
            case 0x77: this.bit(6, Register.A);  break;
            case 0x78: this.bit(7, Register.B);  break;
            case 0x79: this.bit(7, Register.C);  break;
            case 0x7A: this.bit(7, Register.D);  break;
            case 0x7B: this.bit(7, Register.E);  break;
            case 0x7C: this.bit(7, Register.H);  break;
            case 0x7D: this.bit(7, Register.L);  break;
            case 0x7E: this.bit(7, Register.HL); break;
            case 0x7F: this.bit(7, Register.A);  break;
            case 0x80: this.res(0, Register.B);  break;
            case 0x81: this.res(0, Register.C);  break;
            case 0x82: this.res(0, Register.D);  break;
            case 0x83: this.res(0, Register.E);  break;
            case 0x84: this.res(0, Register.H);  break;
            case 0x85: this.res(0, Register.L);  break;
            case 0x86: this.res(0, Register.HL); break;
            case 0x87: this.res(0, Register.A);  break;
            case 0x88: this.res(1, Register.B);  break;
            case 0x89: this.res(1, Register.C);  break;
            case 0x8A: this.res(1, Register.D);  break;
            case 0x8B: this.res(1, Register.E);  break;
            case 0x8C: this.res(1, Register.H);  break;
            case 0x8D: this.res(1, Register.L);  break;
            case 0x8E: this.res(1, Register.HL); break;
            case 0x8F: this.res(1, Register.A);  break;
            case 0x90: this.res(2, Register.B);  break;
            case 0x91: this.res(2, Register.C);  break;
            case 0x92: this.res(2, Register.D);  break;
            case 0x93: this.res(2, Register.E);  break;
            case 0x94: this.res(2, Register.H);  break;
            case 0x95: this.res(2, Register.L);  break;
            case 0x96: this.res(2, Register.HL); break;
            case 0x97: this.res(2, Register.A);  break;
            case 0x98: this.res(3, Register.B);  break;
            case 0x99: this.res(3, Register.C);  break;
            case 0x9A: this.res(3, Register.D);  break;
            case 0x9B: this.res(3, Register.E);  break;
            case 0x9C: this.res(3, Register.H);  break;
            case 0x9D: this.res(3, Register.L);  break;
            case 0x9E: this.res(3, Register.HL); break;
            case 0x9F: this.res(3, Register.A);  break;
            case 0xA0: this.res(4, Register.B);  break;
            case 0xA1: this.res(4, Register.C);  break;
            case 0xA2: this.res(4, Register.D);  break;
            case 0xA3: this.res(4, Register.E);  break;
            case 0xA4: this.res(4, Register.H);  break;
            case 0xA5: this.res(4, Register.L);  break;
            case 0xA6: this.res(4, Register.HL); break;
            case 0xA7: this.res(4, Register.A);  break;
            case 0xA8: this.res(5, Register.B);  break;
            case 0xA9: this.res(5, Register.C);  break;
            case 0xAA: this.res(5, Register.D);  break;
            case 0xAB: this.res(5, Register.E);  break;
            case 0xAC: this.res(5, Register.H);  break;
            case 0xAD: this.res(5, Register.L);  break;
            case 0xAE: this.res(5, Register.HL); break;
            case 0xAF: this.res(5, Register.A);  break;
            case 0xB0: this.res(6, Register.B);  break;
            case 0xB1: this.res(6, Register.C);  break;
            case 0xB2: this.res(6, Register.D);  break;
            case 0xB3: this.res(6, Register.E);  break;
            case 0xB4: this.res(6, Register.H);  break;
            case 0xB5: this.res(6, Register.L);  break;
            case 0xB6: this.res(6, Register.HL); break;
            case 0xB7: this.res(6, Register.A);  break;
            case 0xB8: this.res(7, Register.B);  break;
            case 0xB9: this.res(7, Register.C);  break;
            case 0xBA: this.res(7, Register.D);  break;
            case 0xBB: this.res(7, Register.E);  break;
            case 0xBC: this.res(7, Register.H);  break;
            case 0xBD: this.res(7, Register.L);  break;
            case 0xBE: this.res(7, Register.HL); break;
            case 0xBF: this.res(7, Register.A);  break;
            case 0xC0: this.set(0, Register.B);  break;
            case 0xC1: this.set(0, Register.C);  break;
            case 0xC2: this.set(0, Register.D);  break;
            case 0xC3: this.set(0, Register.E);  break;
            case 0xC4: this.set(0, Register.H);  break;
            case 0xC5: this.set(0, Register.L);  break;
            case 0xC6: this.set(0, Register.HL); break;
            case 0xC7: this.set(0, Register.A);  break;
            case 0xC8: this.set(1, Register.B);  break;
            case 0xC9: this.set(1, Register.C);  break;
            case 0xCA: this.set(1, Register.D);  break;
            case 0xCB: this.set(1, Register.E);  break;
            case 0xCC: this.set(1, Register.H);  break;
            case 0xCD: this.set(1, Register.L);  break;
            case 0xCE: this.set(1, Register.HL); break;
            case 0xCF: this.set(1, Register.A);  break;
            case 0xD0: this.set(2, Register.B);  break;
            case 0xD1: this.set(2, Register.C);  break;
            case 0xD2: this.set(2, Register.D);  break;
            case 0xD3: this.set(2, Register.E);  break;
            case 0xD4: this.set(2, Register.H);  break;
            case 0xD5: this.set(2, Register.L);  break;
            case 0xD6: this.set(2, Register.HL); break;
            case 0xD7: this.set(2, Register.A);  break;
            case 0xD8: this.set(3, Register.B);  break;
            case 0xD9: this.set(3, Register.C);  break;
            case 0xDA: this.set(3, Register.D);  break;
            case 0xDB: this.set(3, Register.E);  break;
            case 0xDC: this.set(3, Register.H);  break;
            case 0xDD: this.set(3, Register.L);  break;
            case 0xDE: this.set(3, Register.HL); break;
            case 0xDF: this.set(3, Register.A);  break;
            case 0xE0: this.set(4, Register.B);  break;
            case 0xE1: this.set(4, Register.C);  break;
            case 0xE2: this.set(4, Register.D);  break;
            case 0xE3: this.set(4, Register.E);  break;
            case 0xE4: this.set(4, Register.H);  break;
            case 0xE5: this.set(4, Register.L);  break;
            case 0xE6: this.set(4, Register.HL); break;
            case 0xE7: this.set(4, Register.A);  break;
            case 0xE8: this.set(5, Register.B);  break;
            case 0xE9: this.set(5, Register.C);  break;
            case 0xEA: this.set(5, Register.D);  break;
            case 0xEB: this.set(5, Register.E);  break;
            case 0xEC: this.set(5, Register.H);  break;
            case 0xED: this.set(5, Register.L);  break;
            case 0xEE: this.set(5, Register.HL); break;
            case 0xEF: this.set(5, Register.A);  break;
            case 0xF0: this.set(6, Register.B);  break;
            case 0xF1: this.set(6, Register.C);  break;
            case 0xF2: this.set(6, Register.D);  break;
            case 0xF3: this.set(6, Register.E);  break;
            case 0xF4: this.set(6, Register.H);  break;
            case 0xF5: this.set(6, Register.L);  break;
            case 0xF6: this.set(6, Register.HL); break;
            case 0xF7: this.set(6, Register.A);  break;
            case 0xF8: this.set(7, Register.B);  break;
            case 0xF9: this.set(7, Register.C);  break;
            case 0xFA: this.set(7, Register.D);  break;
            case 0xFB: this.set(7, Register.E);  break;
            case 0xFC: this.set(7, Register.H);  break;
            case 0xFD: this.set(7, Register.L);  break;
            case 0xFE: this.set(7, Register.HL); break;
            case 0xFF: this.set(7, Register.A);  break;
        }
    }

    private rlc(register: Register) {
        
        if (register === Register.HL)
            this.cycles += 8;

        let value = this.getByteFromRegister(register);
        this.state.flags.carry = (value & 0x80) === 0x80;
        value <<= 1;

        if (this.state.flags.carry)
            value |= 1;

        value &= 0xFF;

        this.state.flags.zero = this.checkZero(value);
        this.state.flags.subtract = false;
        this.state.flags.halfCarry = false;
        this.setByteToRegister(register, value);

        this.cycles += 8;
    }

    private rrc(register: Register) {

        if (register === Register.HL)
            this.cycles += 8;

        let value = this.getByteFromRegister(register);
        this.state.flags.carry = (value & 1) == 1;
        value >>= 1;

        if (this.state.flags.carry)
            value |= 0x80;

        value &= 0xFF;

        this.state.flags.zero = this.checkZero(value);
        this.state.flags.subtract = false;
        this.state.flags.halfCarry = false;
        this.setByteToRegister(register, value);

        this.cycles += 8;
    }

    private rl(register: Register) {

        if (register === Register.HL)
            this.cycles += 8;

        const previousCarry = this.state.flags.carry;
        this.state.flags.carry = ((this.getByteFromRegister(register) & 0x80) >> 7) === 1;
        this.setByteToRegister(register, (this.getByteFromRegister(register) << 1) & 0xFF);

        if (previousCarry)
            this.setByteToRegister(register, (this.getByteFromRegister(register) | 0x1) & 0xFF);

        this.state.flags.zero = this.checkZero(this.getByteFromRegister(register));
        this.state.flags.subtract = false;
        this.state.flags.halfCarry = false;

        this.cycles += 8;
    }

    private rr(register: Register) {
        
        if (register === Register.HL)
            this.cycles += 8;

        const previousCarry = this.state.flags.carry;
        this.state.flags.carry = ((this.getByteFromRegister(register) & 0x1)) === 1;
        this.setByteToRegister(register, (this.getByteFromRegister(register) >> 1) & 0xFF);

        if (previousCarry)
            this.setByteToRegister(register, (this.getByteFromRegister(register) | 0x80) & 0xFF);

        this.state.flags.zero = this.checkZero(this.getByteFromRegister(register));
        this.state.flags.subtract = false;
        this.state.flags.halfCarry = false;

        this.cycles += 8;
    }

    private sla(register: Register) {

        if (register === Register.HL)
            this.cycles += 8;
        
        this.state.flags.carry = ((this.getByteFromRegister(register) & 0x80) >> 7) == 1;
        this.setByteToRegister(register, (this.getByteFromRegister(register) << 1) & 0xFF);

        this.state.flags.zero = this.checkZero(this.getByteFromRegister(register));
        this.state.flags.subtract = false;
        this.state.flags.halfCarry = false;

        this.cycles += 8;
    }

    private sra(register: Register) {
        
        if (register === Register.HL)
            this.cycles += 8;

        const value = this.getByteFromRegister(register);
        const bit7 = (value >> 7) & 0xFF; 
        this.state.flags.carry = (value & 0x1) == 1;
        this.setByteToRegister(register, ((value >> 1) | (bit7 << 7)) & 0xFF);

        this.state.flags.zero = this.checkZero(this.getByteFromRegister(register));
        this.state.flags.subtract = false;
        this.state.flags.halfCarry = false;

        this.cycles += 8;
    }

    private swap(register: Register) {
        
        if (register === Register.HL)
            this.cycles += 8;

        const value = this.getByteFromRegister(register);

        const msb = ((value & 0xF0) >> 4) & 0xFF;
        const lsb = ((value & 0x0F)) & 0xFF;
        const result = ((lsb << 4) | msb) & 0xFF;

        this.setByteToRegister(register, result);

        this.state.flags.zero = this.checkZero(result);
        this.state.flags.subtract = false;
        this.state.flags.halfCarry = false;
        this.state.flags.carry = false;

        this.cycles += 8;
    }

    private srl(register: Register) {
        
        if (register === Register.HL)
            this.cycles += 8;

        const value = this.getByteFromRegister(register);
        this.state.flags.carry = (value & 0x1) == 1;
        this.setByteToRegister(register, (value >> 1) & 0xFF);

        this.state.flags.zero = this.checkZero(this.getByteFromRegister(register));
        this.state.flags.subtract = false;
        this.state.flags.halfCarry = false;

        this.cycles += 8;
    }

    private bit(bitNumber: number, register: Register) {
        
        if (register === Register.HL)
            this.cycles += 8;

        const value = this.getByteFromRegister(register);
        const mask = (0x1 << bitNumber) & 0xFF;
        const bit = (value & mask) == mask;
        this.state.flags.zero = !bit;
        this.state.flags.subtract = false;
        this.state.flags.halfCarry = true;

        this.cycles += 8;
    }

    private res(bitNumber: number, register: Register) {
        
        if (register === Register.HL)
            this.cycles += 8;

        let value = this.getByteFromRegister(register);
        value &= ~(0x1 << bitNumber) & 0xFF;
        this.setByteToRegister(register, value);

        this.cycles += 8;
    }

    private set(bitNumber: number, register: Register) {
        
        if (register === Register.HL)
            this.cycles += 8;

        let value = this.getByteFromRegister(register);
        value |= (0x1 << bitNumber) & 0xFF;
        this.setByteToRegister(register, value);

        this.cycles += 8;
    }

    //#endregion
}
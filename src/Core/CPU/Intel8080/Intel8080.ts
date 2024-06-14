import { LittleEndian } from "../../Util/LittleEndian";
import { State } from "./State";
import { MMU } from "../../Memory/MMU";
import { Register } from "./Register";
import { Opcode } from "./Opcode";

export abstract class Intel8080 {

    protected mmu : MMU;
    protected state : State;
    protected cycles : number = 0;
    public readonly freq : number;

    constructor(mmu : MMU, freq : number, state : State) {
        this.mmu = mmu;
        this.state = state;
        this.freq = freq;
    }

    protected getNextWord() {
        const b1 = this.mmu.get(this.state.pc++);
        this.state.pc &= 0xFFFF;
        const b2 = this.mmu.get(this.state.pc++);
        this.state.pc &= 0xFFFF;
        return LittleEndian.getWordFrom2Bytes(b1, b2);
    }

    protected getNextByte() {
        const value = this.mmu.get(this.state.pc++);
        this.state.pc &= 0xFFFF;
        return value;
    }

    protected readByteFromMemory(addr : number) {
        return this.mmu.get(addr);
    }

    protected writeByteToMemory(addr : number, value : number) {
        this.mmu.set(addr, value);
    }

    protected readWordFromMemory(addr : number) {
        const a = this.mmu.get(addr & 0xFFFF);
        const b = this.mmu.get((addr + 1) & 0xFFFF);
        return LittleEndian.getWordFrom2Bytes(a, b);
    }

    protected writeWordToMemory(addr : number, word : number) {
        const [a, b] = LittleEndian.get2BytesFromWord(word);
        this.mmu.set(addr & 0xFFFF, b);
        this.mmu.set((addr + 1) & 0xFFFF, a);
    }

    protected updateFlags(value : number) {
        this.state.flags.zero = this.checkZero(value);
        this.state.flags.sign = this.checkSign(value);
        this.state.flags.parity = this.checkParity(value);
        this.state.flags.auxiliaryCarry = false;
    }

    protected popStack() {
        const word = this.readWordFromMemory(this.state.sp);
        this.state.sp += 2;
        this.state.sp &= 0xFFFF;
        return word;
    }

    protected pushStack(value : number) {
        this.state.sp -= 2;
        this.state.sp &= 0xFFFF;
        this.writeWordToMemory(this.state.sp, value);
    }

    protected getByteFromRegister(register : Register) {
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
            default:
                throw new Error("Unknown register.");
        }
    }

    protected getWordFromRegister(register : Register) {
        switch (register) {
            case Register.AF: return this.state.af;
            case Register.BC: return this.state.bc;
            case Register.DE: return this.state.de;
            case Register.HL: return this.state.hl;
            case Register.SP: return this.state.sp;
            case Register.PC: return this.state.pc;
            default:
                throw new Error("Can't fetch word from this register.");
        }
    }

    public generateInterrupt(interruptNumber : number) {
        if (this.state.enableInterrupts) {
            this.pushStack(this.state.pc);
            this.di();
            this.state.pc = (8 * interruptNumber) & 0xFFFF;
        }

        return interruptNumber;
    }

    protected checkZero(value : number) {
        return value === 0;
    }

    protected checkSign(value : number) {
        return (value & 0x80) === 0x80;
    }

    protected checkParity(value : number) {
        let numberOfOneBits = 0;

        for (let i = 0; i < 8; i++) 
            numberOfOneBits += ((value >> i) & 1) & 0xFF;

        return (numberOfOneBits & 1) === 0;
    }

    protected checkAuxiliaryCarryAdd(bytes : number[])
    {
        for (let i = 0; i < bytes.length; i++)
            bytes[i] &= 0x0F;

        return bytes.reduce((a, b) => a + b) >= 0x10;
    }

    protected callDiagnosticsRoutine() {
        
        if (this.state.c === 9) {
            let sb = "";

            let offset = LittleEndian.getWordFrom2Bytes(this.state.e, this.state.d);
            offset += 3;

            let c = String.fromCharCode(this.mmu.get(offset));

            while (c !== '$') {
                sb += c;
                c = String.fromCharCode(this.mmu.get(++offset));
            }

            this.hlt();

            if (sb.length > 0)
                process.stdout.write(sb + "\n");
        } else if (this.state.c === 2) {
            process.stdout.write(String.fromCharCode(this.state.e));
        }
        
        this.cycles += 7;
    }

    public stepCycle() {

        const opcode = new Opcode(this.getNextByte());
        const previousCycles = this.cycles;

        switch (opcode.value) {
            case 0x00: 
            case 0x10:
            case 0x20:
            case 0x30: this.nop(); break;
            case 0x01: this.lxi(Register.BC); break;
            case 0x11: this.lxi(Register.DE); break;
            case 0x21: this.lxi(Register.HL); break;
            case 0x31: this.lxi(Register.SP); break;
            case 0x02: this.stax(Register.BC); break;
            case 0x12: this.stax(Register.DE); break;
            case 0x03: this.inx(Register.BC); break;
            case 0x13: this.inx(Register.DE); break;
            case 0x23: this.inx(Register.HL);break;
            case 0x33: this.inx(Register.SP); break;
            case 0x04: this.inr(Register.B); break;
            case 0x14: this.inr(Register.D); break;
            case 0x24: this.inr(Register.H); break;
            case 0x34: this.inr(Register.HL); break;
            case 0x05: this.dcr(Register.B); break;
            case 0x15: this.dcr(Register.D); break;
            case 0x25: this.dcr(Register.H); break;
            case 0x35: this.dcr(Register.HL); break;
            case 0x06: this.mvi(Register.B); break;
            case 0x16: this.mvi(Register.D); break;
            case 0x26: this.mvi(Register.H); break;
            case 0x36: this.mvi(Register.HL); break;
            case 0x07: this.rlc(); break;
            case 0x08:
            case 0x18:
            case 0x28:
            case 0x38: this.nop(); break;
            case 0x09: this.dad(Register.BC); break;
            case 0x19: this.dad(Register.DE); break;
            case 0x29: this.dad(Register.HL); break;
            case 0x39: this.dad(Register.SP); break;
            case 0x0A: this.ldax(Register.BC); break;
            case 0x1A: this.ldax(Register.DE); break;
            case 0x0B: this.dcx(Register.BC); break;
            case 0x1B: this.dcx(Register.DE); break;
            case 0x2B: this.dcx(Register.HL); break;
            case 0x3B: this.dcx(Register.SP); break;
            case 0x0C: this.inr(Register.C); break;
            case 0x1C: this.inr(Register.E); break;
            case 0x2C: this.inr(Register.L); break;
            case 0x3C: this.inr(Register.A); break;
            case 0x0D: this.dcr(Register.C); break;
            case 0x1D: this.dcr(Register.E); break;
            case 0x2D: this.dcr(Register.L); break;
            case 0x3D: this.dcr(Register.A); break;
            case 0x0E: this.mvi(Register.C); break;
            case 0x1E: this.mvi(Register.E); break;
            case 0x2E: this.mvi(Register.L); break;
            case 0x3E: this.mvi(Register.A); break;
            case 0x0F: this.rrc(); break;
            case 0x17: this.ral(); break;
            case 0x1F: this.rar(); break;
            case 0x22: this.shld(); break;
            case 0x27: this.daa(); break;
            case 0x2A: this.lhld(); break;
            case 0x2F: this.cma(); break;
            case 0x32: this.sta(); break;
            case 0x37: this.stc(); break;
            case 0x3A: this.lda(); break;
            case 0x3F: this.cmc(); break;
            case 0x40: this.mov(Register.B, Register.B); break;
            case 0x41: this.mov(Register.B, Register.C); break;
            case 0x42: this.mov(Register.B, Register.D); break;
            case 0x43: this.mov(Register.B, Register.E); break;
            case 0x44: this.mov(Register.B, Register.H); break;
            case 0x45: this.mov(Register.B, Register.L); break;
            case 0x46: this.mov(Register.B, Register.HL); break;
            case 0x47: this.mov(Register.B, Register.A); break;
            case 0x48: this.mov(Register.C, Register.B); break;
            case 0x49: this.mov(Register.C, Register.C); break;
            case 0x4A: this.mov(Register.C, Register.D); break;
            case 0x4B: this.mov(Register.C, Register.E); break;
            case 0x4C: this.mov(Register.C, Register.H); break;
            case 0x4D: this.mov(Register.C, Register.L); break;
            case 0x4E: this.mov(Register.C, Register.HL); break;
            case 0x4F: this.mov(Register.C, Register.A); break;
            case 0x50: this.mov(Register.D, Register.B); break;
            case 0x51: this.mov(Register.D, Register.C); break;
            case 0x52: this.mov(Register.D, Register.D); break;
            case 0x53: this.mov(Register.D, Register.E); break;
            case 0x54: this.mov(Register.D, Register.H); break;
            case 0x55: this.mov(Register.D, Register.L); break;
            case 0x56: this.mov(Register.D, Register.HL); break;
            case 0x57: this.mov(Register.D, Register.A); break;
            case 0x58: this.mov(Register.E, Register.B); break;
            case 0x59: this.mov(Register.E, Register.C); break;
            case 0x5A: this.mov(Register.E, Register.D); break;
            case 0x5B: this.mov(Register.E, Register.E); break;
            case 0x5C: this.mov(Register.E, Register.H); break;
            case 0x5D: this.mov(Register.E, Register.L); break;
            case 0x5E: this.mov(Register.E, Register.HL); break;
            case 0x5F: this.mov(Register.E, Register.A); break;
            case 0x60: this.mov(Register.H, Register.B); break;
            case 0x61: this.mov(Register.H, Register.C); break;
            case 0x62: this.mov(Register.H, Register.D); break;
            case 0x63: this.mov(Register.H, Register.E); break;
            case 0x64: this.mov(Register.H, Register.H); break;
            case 0x65: this.mov(Register.H, Register.L); break;
            case 0x66: this.mov(Register.H, Register.HL); break;
            case 0x67: this.mov(Register.H, Register.A); break;
            case 0x68: this.mov(Register.L, Register.B); break;
            case 0x69: this.mov(Register.L, Register.C); break;
            case 0x6A: this.mov(Register.L, Register.D); break;
            case 0x6B: this.mov(Register.L, Register.E); break;
            case 0x6C: this.mov(Register.L, Register.H); break;
            case 0x6D: this.mov(Register.L, Register.L); break;
            case 0x6E: this.mov(Register.L, Register.HL); break;
            case 0x6F: this.mov(Register.L, Register.A); break;
            case 0x70: this.mov(Register.HL, Register.B); break;
            case 0x71: this.mov(Register.HL, Register.C); break;
            case 0x72: this.mov(Register.HL, Register.D); break;
            case 0x73: this.mov(Register.HL, Register.E); break;
            case 0x74: this.mov(Register.HL, Register.H); break;
            case 0x75: this.mov(Register.HL, Register.L); break;
            case 0x76: this.hlt(); break;
            case 0x77: this.mov(Register.HL, Register.A); break;
            case 0x78: this.mov(Register.A, Register.B); break;
            case 0x79: this.mov(Register.A, Register.C); break;
            case 0x7A: this.mov(Register.A, Register.D); break;
            case 0x7B: this.mov(Register.A, Register.E); break;
            case 0x7C: this.mov(Register.A, Register.H); break;
            case 0x7D: this.mov(Register.A, Register.L); break;
            case 0x7E: this.mov(Register.A, Register.HL); break;
            case 0x7F: this.mov(Register.A, Register.A); break;
            case 0x80: this.add(Register.B);  break;
            case 0x81: this.add(Register.C);  break;
            case 0x82: this.add(Register.D);  break;
            case 0x83: this.add(Register.E);  break;
            case 0x84: this.add(Register.H);  break;
            case 0x85: this.add(Register.L);  break;
            case 0x86: this.add(Register.HL);  break;
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
            case 0x98: this.sbb(Register.B); break;
            case 0x99: this.sbb(Register.C); break;
            case 0x9A: this.sbb(Register.D); break;
            case 0x9B: this.sbb(Register.E); break;
            case 0x9C: this.sbb(Register.H); break;
            case 0x9D: this.sbb(Register.L); break;
            case 0x9E: this.sbb(Register.HL);break;
            case 0x9F: this.sbb(Register.A); break;
            case 0xA0: this.ana(Register.B); break;
            case 0xA1: this.ana(Register.C); break;
            case 0xA2: this.ana(Register.D); break;
            case 0xA3: this.ana(Register.E); break;
            case 0xA4: this.ana(Register.H); break;
            case 0xA5: this.ana(Register.L); break;
            case 0xA6: this.ana(Register.HL);break;
            case 0xA7: this.ana(Register.A); break;
            case 0xA8: this.xra(Register.B); break;
            case 0xA9: this.xra(Register.C); break;
            case 0xAA: this.xra(Register.D); break;
            case 0xAB: this.xra(Register.E); break;
            case 0xAC: this.xra(Register.H); break;
            case 0xAD: this.xra(Register.L); break;
            case 0xAE: this.xra(Register.HL);break;
            case 0xAF: this.xra(Register.A); break;
            case 0xB0: this.ora(Register.B); break;
            case 0xB1: this.ora(Register.C); break;
            case 0xB2: this.ora(Register.D); break;
            case 0xB3: this.ora(Register.E); break;
            case 0xB4: this.ora(Register.H); break;
            case 0xB5: this.ora(Register.L); break;
            case 0xB6: this.ora(Register.HL);break;
            case 0xB7: this.ora(Register.A); break;
            case 0xB8: this.cmp(Register.B); break;
            case 0xB9: this.cmp(Register.C); break;
            case 0xBA: this.cmp(Register.D); break;
            case 0xBB: this.cmp(Register.E); break;
            case 0xBC: this.cmp(Register.H); break;
            case 0xBD: this.cmp(Register.L); break;
            case 0xBE: this.cmp(Register.HL);break;
            case 0xBF: this.cmp(Register.A); break;
            case 0xC0: this.rnz(); break;
            case 0xD0: this.rnc(); break;
            case 0xE0: this.rpo(); break;
            case 0xF0: this.rp(); break;
            case 0xC1: this.pop(Register.BC); break;
            case 0xD1: this.pop(Register.DE); break;
            case 0xE1: this.pop(Register.HL); break;
            case 0xF1: this.popPsw(); break;
            case 0xC2: this.jnz(); break;
            case 0xD2: this.jnc(); break;
            case 0xE2: this.jpo(); break;
            case 0xF2: this.jp(); break;
            case 0xC3: this.jmp(); break;
            case 0xC4: this.cnz(); break;
            case 0xD4: this.cnc(); break;
            case 0xE4: this.cpo(); break;
            case 0xF4: this.cp(); break;
            case 0xC5: this.push(Register.BC); break;
            case 0xD5: this.push(Register.DE); break;
            case 0xE5: this.push(Register.HL); break;
            case 0xF5: this.push(Register.AF); break;
            case 0xC6: this.adi(); break;
            case 0xD6: this.sui(); break;
            case 0xE6: this.ani(); break;
            case 0xF6: this.ori(); break;
            case 0xC7: this.rst(0); break;
            case 0xD7: this.rst(2); break;
            case 0xE7: this.rst(4); break;
            case 0xF7: this.rst(6); break;
            case 0xC8: this.rz(); break;
            case 0xD8: this.rc(); break;
            case 0xE8: this.rpe(); break;
            case 0xF8: this.rm(); break;
            case 0xC9: this.ret(); break;
            case 0xD9: this.ret(); break;
            case 0xCA: this.jz(); break;
            case 0xDA: this.jc(); break;
            case 0xEA: this.jpe(); break;
            case 0xFA: this.jm(); break;
            case 0xCB: this.jmp(); break;
            case 0xCC: this.cz(); break;
            case 0xDC: this.cc(); break;
            case 0xEC: this.cpe(); break;
            case 0xFC: this.cm(); break;
            case 0xCD: this.call(); break;
            case 0xDD: this.call(); break;
            case 0xED: this.call(); break;
            case 0xFD: this.call(); break;
            case 0xCE: this.aci(); break;
            case 0xDE: this.sbi(); break;
            case 0xEE: this.xri(); break;
            case 0xFE: this.cpi(); break;
            case 0xCF: this.rst(1); break;
            case 0xDF: this.rst(3); break;
            case 0xEF: this.rst(5); break;
            case 0xFF: this.rst(7); break;
            case 0xD3: this.out(); break;
            case 0xDB: this.in(); break;
            case 0xE3: this.xthl(); break;
            case 0xE9: this.pchl(); break;
            case 0xEB: this.xchg(); break;
            case 0xF3: this.di(); break;
            case 0xF9: this.sphl(); break;
            case 0xFB: this.ei(); break;
        }

        opcode.cyclesTaken = this.cycles - previousCycles;

        return opcode;
    }

    //#region Instructions

    protected nop() {
        this.cycles += 4;
    }

    protected lxi(register : Register) {
        switch (register) {
            case Register.BC:
                this.state.c = this.mmu.get(this.state.pc++);
                this.state.pc &= 0xFFFF;
                this.state.b = this.mmu.get(this.state.pc++);
                this.state.pc &= 0xFFFF;
                break;
            case Register.DE:
                this.state.e = this.mmu.get(this.state.pc++);
                this.state.pc &= 0xFFFF;
                this.state.d = this.mmu.get(this.state.pc++);
                this.state.pc &= 0xFFFF;
                break;
            case Register.HL:
                this.state.l = this.mmu.get(this.state.pc++);
                this.state.pc &= 0xFFFF;
                this.state.h = this.mmu.get(this.state.pc++);
                this.state.pc &= 0xFFFF;
                break;
            case Register.SP:
                const byte1 = this.mmu.get(this.state.pc++);
                this.state.pc &= 0xFFFF;
                const byte2 = this.mmu.get(this.state.pc++);
                this.state.pc &= 0xFFFF;
                this.state.sp = LittleEndian.getWordFrom2Bytes(byte1, byte2);
                break;
        }

        this.cycles += 10;
    }

    protected stax(register : Register) {
        if (register === Register.BC)
            this.mmu.set(this.state.bc, this.state.a);
        else if (register === Register.DE)
            this.mmu.set(this.state.de, this.state.a);

        this.cycles += 7;
    }

    protected shld() {
        const value = this.state.hl;
        const addr = this.getNextWord();
        this.writeWordToMemory(addr, value);
        this.cycles += 16;
    }

    protected sta() {
        this.writeByteToMemory(this.getNextWord(), this.state.a);
        this.cycles += 13;
    }

    protected inx(register : Register) {
        switch (register)
        {
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

        this.cycles += 5;

    }

    protected inr(register : Register) {
        switch (register) {
            case Register.A: 
                this.state.a++; 
                this.state.a &= 0xFF;
                this.updateFlags(this.state.a); 
                break;
            case Register.B: 
                this.state.b++; 
                this.state.b &= 0xFF;
                this.updateFlags(this.state.b); 
                break;
            case Register.C: 
                this.state.c++; 
                this.state.c &= 0xFF;
                this.updateFlags(this.state.c); 
                break;
            case Register.D: 
                this.state.d++; 
                this.state.d &= 0xFF;
                this.updateFlags(this.state.d); 
                break;
            case Register.E: 
                this.state.e++; 
                this.state.e &= 0xFF;
                this.updateFlags(this.state.e); 
                break;
            case Register.H: 
                this.state.h++; 
                this.state.h &= 0xFF;
                this.updateFlags(this.state.h); 
                break;
            case Register.L: 
                this.state.l++; 
                this.state.l &= 0xFF;
                this.updateFlags(this.state.l); 
                break;
            case Register.HL: 
                let value = this.readByteFromMemory(this.state.hl) + 1;
                value &= 0xFF;
                this.writeByteToMemory(this.state.hl, value); 
                this.updateFlags(value); 
                this.cycles += 5; 
                break;
        }

        this.cycles += 5;
    }

    protected dcr(register : Register) {
        switch (register) {
            case Register.A: 
                this.state.a--; 
                this.state.a &= 0xFF; 
                this.updateFlags(this.state.a); 
                break;
            case Register.B: 
                this.state.b--; 
                this.state.b &= 0xFF; 
                this.updateFlags(this.state.b);
                break;
            case Register.C: 
                this.state.c--; 
                this.state.c &= 0xFF; 
                this.updateFlags(this.state.c); 
                break;
            case Register.D: 
                this.state.d--; 
                this.state.d &= 0xFF; 
                this.updateFlags(this.state.d); 
                break;
            case Register.E: 
                this.state.e--; 
                this.state.e &= 0xFF; 
                this.updateFlags(this.state.e); 
                break;
            case Register.H: 
                this.state.h--; 
                this.state.h &= 0xFF; 
                this.updateFlags(this.state.h); 
                break;
            case Register.L: 
                this.state.l--; 
                this.state.l &= 0xFF; 
                this.updateFlags(this.state.l); 
                break;
            case Register.HL: 
                let value = this.readByteFromMemory(this.state.hl) - 1;
                value &= 0xFF;
                this.writeByteToMemory(this.state.hl, value); 
                this.updateFlags(value); 
                this.cycles += 5; 
                break;
        }

        this.cycles += 5;
    }

    protected mvi(register : Register) {
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
                this.cycles += 3; 
                break;
        }

        this.cycles += 7;   
    }

    protected rlc() {
        this.state.flags.carry = ((this.state.a & 0x80) >> 7) === 1;
        this.state.a <<= 1;

        if (this.state.flags.carry)
            this.state.a |= 1;

        this.state.a &= 0xFF;
        this.cycles += 4;
    }

    protected rrc() {
        this.state.flags.carry = (this.state.a & 0x1) === 1;
        this.state.a >>= 1;

        if (this.state.flags.carry)
            this.state.a |= 0x80;

        this.cycles += 4;
    }

    protected ral() {
        const previousCarry = this.state.flags.carry;
        this.state.flags.carry = ((this.state.a & 0x80) >> 7) === 1;
        this.state.a <<= 1;

        if (previousCarry)
            this.state.a |= 1;

        this.state.a &= 0xFF;
        this.cycles += 4;
    }

    protected rar() {
        const previousCarry = this.state.flags.carry;
        this.state.flags.carry = (this.state.a & 0x1) === 1;
        this.state.a >>= 1;

        if (previousCarry)
            this.state.a |= 0x80;

        this.cycles += 4;
    }

    protected daa() {
        let carry = this.state.flags.carry;
        let correction = 0;

        let lsb = (this.state.a & 0x0F) & 0xFF;
        let msb = (this.state.a >> 4) & 0xFF;

        if (this.state.flags.auxiliaryCarry || lsb > 9)
            correction += 0x06;
        
        if (this.state.flags.carry || msb > 9 || (msb >= 9 && lsb > 9)) {
            correction += 0x60;
            carry = true;
        }

        this.state.a += correction;
        this.state.a &= 0xFF;
        this.updateFlags(this.state.a);
        this.state.flags.carry = carry;

        this.cycles += 4;
    }

    protected stc() {
        this.state.flags.carry = true;
        this.cycles += 4;
    }

    protected dad(register : Register) {
        const word = this.getWordFromRegister(register);
        this.state.flags.carry = ((this.state.hl + word) & 0x10000) === 0x10000;
        this.state.hl += word;
        this.state.hl &= 0xFFFF;
        this.cycles += 4;
    }

    protected ldax(register : Register) {
        const value = this.getByteFromRegister(register);
        this.state.a = value;
        this.cycles += 7;
    }

    protected lhld() {
        const addr = this.getNextWord();
        this.state.hl = this.readWordFromMemory(addr);
        this.cycles += 16;
    }

    protected lda() {
        this.state.a = this.readByteFromMemory(this.getNextWord());
        this.cycles += 13;
    }

    protected dcx(register : Register) {
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

        this.cycles += 5;
    }

    protected cma() {
        this.state.a = (~this.state.a) & 0xFF;
        this.cycles += 4;
    }

    protected cmc() {
        this.state.flags.carry = !this.state.flags.carry;
        this.cycles += 4;
    }

    protected mov(registerA : Register, registerB : Register) {
        const value = this.getByteFromRegister(registerB);

        if (registerB === Register.HL)
            this.cycles += 2;

        switch (registerA)
        {
            case Register.A: this.state.a = value; break;
            case Register.B: this.state.b = value; break;
            case Register.C: this.state.c = value; break;
            case Register.D: this.state.d = value; break;
            case Register.E: this.state.e = value; break;
            case Register.H: this.state.h = value; break;
            case Register.L: this.state.l = value; break;
            case Register.HL: this.writeByteToMemory(this.state.hl, value); this.cycles += 2; break;
        }

        this.cycles += 5;
    }

    protected add(register : Register) {
        const value = this.getByteFromRegister(register);

        if (register === Register.HL)
            this.cycles += 3;

        const result = this.state.a + value;

        this.updateFlags(result & 0xFF);
        this.state.flags.carry = (result & 0x100) === 0x100; 
        this.state.flags.auxiliaryCarry = this.checkAuxiliaryCarryAdd([this.state.a, value]);
        this.state.a = (this.state.a + value) & 0xFF;
        this.cycles += 4;
    }

    protected adi() {
        const value = this.getNextByte();
        const result = this.state.a + value;

        this.updateFlags(result & 0xFF);
        
        this.state.flags.carry = (result & 0x100) === 0x100; 
        this.state.flags.auxiliaryCarry = this.checkAuxiliaryCarryAdd([this.state.a, value]);
        this.state.a = (this.state.a + value) & 0xFF;
        this.cycles += 7;
    }

    protected aci() {
        const value = this.getNextByte();
        const carryValue = this.state.flags.carry ? 1 : 0;
        const result = this.state.a + value + carryValue;
        this.updateFlags(result & 0xFF);
        this.state.flags.carry = (result & 0x100) === 0x100; 
        this.state.flags.auxiliaryCarry = this.checkAuxiliaryCarryAdd([this.state.a, value]);
        this.state.a = (this.state.a + value + carryValue) & 0xFF;
        this.cycles += 7;
    }

    protected adc(register : Register) {
        const value = this.getByteFromRegister(register);
        const carryValue = this.state.flags.carry ? 1 : 0;

        if (register === Register.HL)
            this.cycles += 3;

        const result = this.state.a + value + carryValue;
        this.updateFlags(result & 0xFF);
        this.state.flags.carry = (result & 0x100) === 0x100; 
        this.state.flags.auxiliaryCarry = this.checkAuxiliaryCarryAdd([this.state.a, value, carryValue]);
        this.state.a = (this.state.a + value + carryValue) & 0xFF;
        this.cycles += 4;
    }

    protected sub(register : Register) {
        const value = this.getByteFromRegister(register);

        if (register === Register.HL)
            this.cycles += 3;

        const result = this.state.a - value;
        this.updateFlags(result & 0xFF);
        this.state.flags.carry = result < 0;
        this.state.a = (this.state.a - value) & 0xFF;
        this.cycles += 4;   
    }

    protected sui() {
        const value = this.getNextByte();
        const result = this.state.a - value;
        this.updateFlags(result & 0xFF);
        this.state.flags.carry = result < 0; 
        this.state.a = (this.state.a - value) & 0xFF;
        this.cycles += 7;   
    }

    protected sbi() {
        const value = this.getNextByte();
        const carryValue = this.state.flags.carry ? 1 : 0;
        const result = this.state.a - value - carryValue;
        this.updateFlags(result & 0xFF);
        this.state.flags.carry = result < 0; 
        this.state.a = (this.state.a - value - carryValue) & 0xFF;
        this.cycles += 7;   
    }

    protected sbb(register : Register) {
        const value = this.getByteFromRegister(register);
        const carryValue = this.state.flags.carry ? 1 : 0;

        if (register === Register.HL)
            this.cycles += 3;

        const result = this.state.a - value - carryValue;
        this.updateFlags(result & 0xFF);
        this.state.flags.carry = result < 0; 
        this.state.a = (this.state.a - value - carryValue) & 0xFF;
        this.cycles += 4;   
    }

    protected ana(register : Register) {
        const value = this.getByteFromRegister(register);

        if (register === Register.HL)
            this.cycles += 3;

        this.state.flags.carry = false;
        this.state.a &= value;
        this.updateFlags(this.state.a);
        this.cycles += 4;
    }

    protected ani() {
        const value = this.getNextByte();
        this.state.flags.carry = false;
        this.state.a &= value;
        this.updateFlags(this.state.a);
        this.cycles += 7;
    }

    protected xra(register : Register) {
        const value = this.getByteFromRegister(register);

        if (register === Register.HL)
            this.cycles += 3;

        this.state.flags.carry = false;
        this.state.a ^= value;
        this.updateFlags(this.state.a);
        this.cycles += 4;
    }

    protected xri() {
        const value = this.getNextByte();
        this.state.flags.carry = false;
        this.state.a ^= value;
        this.updateFlags(this.state.a);
        this.cycles += 7;
    }

    protected ora(register : Register) {
        const value = this.getByteFromRegister(register);

        if (register === Register.HL)
            this.cycles += 3;

        this.state.flags.carry = false;
        this.state.a |= value;
        this.updateFlags(this.state.a);
        this.cycles += 4;
    }

    protected ori() {
        const value = this.getNextByte();
        this.state.flags.carry = false;
        this.state.a |= value;
        this.updateFlags(this.state.a);
        this.cycles += 7;
    }

    protected cmp(register : Register) {
        const value = this.getByteFromRegister(register);

        if (register === Register.HL)
            this.cycles += 3;

        const result = (this.state.a - value) & 0xFFFF;
        this.state.flags.carry = (result & 0xF000) === 0xF000;
        this.updateFlags(((this.state.a - value) & 0xFF));
        this.cycles += 4;
    }

    protected cpi() {
        const value = this.getNextByte();                
        const result = (this.state.a - value) & 0xFFFF;
        this.state.flags.carry = (result & 0xF000) === 0xF000;                
        this.updateFlags(((this.state.a - value) & 0xFF));
        this.cycles += 7;
    }

    protected ret() {
        this.state.pc = this.popStack();
        this.cycles += 10;
    }

    protected conditionalRet(condition : boolean)
    {
        if (condition) {
            this.ret();
            this.cycles += 1;
        }
        else
            this.cycles += 5;
    }

    protected rnz() {
        this.conditionalRet(!this.state.flags.zero);
    }

    protected rnc() {
        this.conditionalRet(!this.state.flags.carry);
    }

    protected rpo() {
        this.conditionalRet(!this.state.flags.parity);
    }

    protected rp() {
        this.conditionalRet(!this.state.flags.sign);
    }

    protected rz() {
        this.conditionalRet(this.state.flags.zero);
    }

    protected rc() {
        this.conditionalRet(this.state.flags.carry);
    }

    protected rpe() {
        this.conditionalRet(this.state.flags.parity);
    }

    protected rm() {
        this.conditionalRet(this.state.flags.sign);
    }

    protected pop(register : Register) {
        switch (register) {
            case Register.BC: this.state.bc = this.popStack(); break;
            case Register.DE: this.state.de = this.popStack(); break;
            case Register.HL: this.state.hl = this.popStack(); break;
        }

        this.cycles += 10;
    }

    protected popPsw() {
        const af = this.popStack();
        this.state.a = (af >> 8) & 0xFF;
        const psw = (af & 0xFF);
        
        this.state.flags.sign = ((psw >> 7) & 1) === 1;
        this.state.flags.zero = ((psw >> 6) & 1) === 1;
        this.state.flags.auxiliaryCarry = ((psw >> 4) & 1) === 1;
        this.state.flags.parity = ((psw >> 2) & 1) === 1;
        this.state.flags.carry = (psw & 1) === 1;

        this.cycles += 10;
    }

    protected push(register : Register) {
        switch (register) {
            case Register.BC: this.pushStack(this.state.bc); break;
            case Register.DE: this.pushStack(this.state.de); break;
            case Register.HL: this.pushStack(this.state.hl); break;
            case Register.AF: this.pushStack(this.state.af); break;
        }

        this.cycles += 11;
    }

    protected jmp(addr?: number) {
        if (addr === undefined)
            addr = this.getNextWord();

        this.state.pc = addr;
        this.cycles += 10;
    }

    protected conditionalJmp(condition : boolean)
    {
        if (condition)
            this.jmp();
        else
            this.getNextWord();

        this.cycles += 3;
    }

    protected jnz() {
        this.conditionalJmp(!this.state.flags.zero);
    }

    protected jnc() {
        this.conditionalJmp(!this.state.flags.carry);
    }

    protected jpo() {
        this.conditionalJmp(!this.state.flags.parity);
    }

    protected jp() {
        this.conditionalJmp(!this.state.flags.sign);
    }

    protected jz() {
        this.conditionalJmp(this.state.flags.zero);
    }

    protected jc() {
        this.conditionalJmp(this.state.flags.carry);
    }

    protected jpe() {
        this.conditionalJmp(this.state.flags.parity);
    }

    protected jm() {
        this.conditionalJmp(this.state.flags.sign);
    }

    protected abstract in() : void;
    protected abstract out(): void;


    protected xthl() {
        const value = this.readWordFromMemory(this.state.sp);
        this.writeWordToMemory(this.state.sp, this.state.hl);
        this.state.hl = value;

        this.cycles += 18;
    }

    protected di() {
        this.state.enableInterrupts = false;
        this.cycles += 4;
    }

    protected ei() {
        this.state.enableInterrupts = true;
        this.cycles += 4;
    }

    protected call(addr?: number) {

        if (addr === undefined)
            addr = this.getNextWord();

        // if (addr === 5) {
        //     this.callDiagnosticsRoutine();
        //     return;
        // }

        this.pushStack(this.state.pc);
        this.jmp(addr);
        this.cycles += 7;
    }

    protected conditionalCall(condition : boolean)
    {
        if (condition)
            this.call();
        else
        {
            this.getNextWord();
            this.cycles += 11;
        }
    }

    protected cnz() {
        this.conditionalCall(!this.state.flags.zero);
    }

    protected cnc() {
        this.conditionalCall(!this.state.flags.carry);
    }

    protected cpo() {
        this.conditionalCall(!this.state.flags.parity);
    }

    protected cp() {
        this.conditionalCall(!this.state.flags.sign);
    }

    protected cz() {
        this.conditionalCall(this.state.flags.zero);
    }

    protected cc() {
        this.conditionalCall(this.state.flags.carry);
    }

    protected cpe() {
        this.conditionalCall(this.state.flags.parity);
    }

    protected cm() {
        this.conditionalCall(this.state.flags.sign);
    }

    protected rst(num : number) {
        switch (num) {
            case 0: this.call(0x00); break;
            case 1: this.call(0x08); break;
            case 2: this.call(0x10); break;
            case 3: this.call(0x18); break;
            case 4: this.call(0x20); break;
            case 5: this.call(0x28); break;
            case 6: this.call(0x30); break;
            case 7: this.call(0x38); break;
        }

        this.cycles += 11;
    }

    protected pchl() {
        this.state.pc = this.state.hl;
        this.cycles += 5;
    }

    protected sphl() {
        this.state.sp = this.state.hl;
        this.cycles += 5;
    }

    protected xchg()
    {
        const de = this.state.de;
        this.state.de = this.state.hl;
        this.state.hl = de;
        this.cycles += 5;
    }

    protected hlt()
    {
        this.state.halted = true;
        this.cycles += 7;
    }

    //#endregion
}



import { Intel8080 } from "../../Core/CPU/Intel8080/Intel8080";
import { LittleEndian } from "../../Core/Util/LittleEndian";

export class CPU extends Intel8080 {

    protected override in() { 

        const port = this.getNextByte();

        switch (port) {
            case 1:
                this.state.a = this.state.ports.read1;
                break;
            case 2:
                this.state.a = this.state.ports.read2;
                break;
            case 3:
                const value = LittleEndian.getWordFrom2Bytes(this.state.ports.shift0, this.state.ports.shift1);
                this.state.a = ((value >> (8 - this.state.ports.write2)) & 0xFF) & 0xFF;
                break;
            default:
                break;
        }

        this.cycles += 10;
    }

    protected override out() { 

        const port = this.getNextByte();

            switch (port) {
                case 2:
                    this.state.ports.write2 = this.state.a & 0x7;
                    break;
                case 3:
                    this.state.ports.write3 = this.state.a;
                    break;
                case 4:
                    this.state.ports.shift0 = this.state.ports.shift1;
                    this.state.ports.shift1 = this.state.a;
                    break;
                case 5:
                    this.state.ports.write5 = this.state.a;
                    break;
                default:
                    break;
			}

            this.cycles += 10;
    }
}
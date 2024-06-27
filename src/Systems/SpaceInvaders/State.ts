import { State as State8080 } from "../../Core/CPU/Intel8080/State";

export class State extends State8080 {

    public draw : boolean = false;

    public updateKeys(keys: string[]) {

        this.ports.read1 = 0;
            
        if (keys.indexOf("5") >= 0)
            this.ports.read1 |= (1 << 0) & 0xFF;
        
        if (keys.indexOf("1") >= 0)
            this.ports.read1 |= (1 << 2) & 0xFF;
        
        if (keys.indexOf(" ") >= 0)
            this.ports.read1 |= (1 << 4) & 0xFF;

        if (keys.indexOf("ArrowLeft") >= 0)
            this.ports.read1 |= (1 << 5) & 0xFF;

        if (keys.indexOf("ArrowRight") >= 0)
            this.ports.read1 |= (1 << 6) & 0xFF;
    }
}
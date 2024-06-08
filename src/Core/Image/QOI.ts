import { BigEndian } from "../Util/BigEndian";
import { Framebuffer } from "../Video/Framebuffer";
import { Pixel } from "../Video/Pixel";
import { Image } from "./Image";

enum ChunkType {
    QOI_OP_RGB = 0xFE,
    QOI_OP_RGBA = 0xFF,
    QOI_OP_INDEX = 0b00,
    QOI_OP_DIFF = 0b01,
    QOI_OP_LUMA = 0b10,
    QOI_OP_RUN = 0b11
}

export class QOI extends Image {

    private search: Pixel[] = new Array<Pixel>(64);

    public static from(framebuffer : Framebuffer) {
        
        const qoi = new QOI(framebuffer.width, framebuffer.height);

        for (let j = 0; j < qoi.height; j++)
            for (let i = 0; i < qoi.width; i++)
                qoi.set(i, j, framebuffer.get(i, j));

        return qoi;
    }

    private getHeader() {

        const header = new Array<number>();
        const magic = 'qoif';

        for (let i = 0; i < magic.length; i++)
            header.push(magic.charCodeAt(i));

        header.push(...BigEndian.get4BytesFromDWord(this.width));
        header.push(...BigEndian.get4BytesFromDWord(this.height));
        header.push(4);
        header.push(0x0);

        return header;
    }

    private getRGBChunk(pixel: Pixel) {
        return [ ChunkType.QOI_OP_RGB, pixel.R, pixel.G, pixel.B ];
    }

    private getRGBAChunk(pixel: Pixel) {
        return [ ChunkType.QOI_OP_RGBA, pixel.R, pixel.G, pixel.B, pixel.A ];
    }

    private getRunChunk(count: number) {
        return (ChunkType.QOI_OP_RUN << 6) | ((count - 1) & 0x3F);
    }

    private getIndexChunk(count: number) {
        return (ChunkType.QOI_OP_INDEX << 6) | (count & 0x3F);
    }

    private getDiffChunk(diffR: number, diffG: number, diffB: number) {
        return (ChunkType.QOI_OP_DIFF << 6) | 
            (((diffR + 2) << 4) & 0x30) | 
            (((diffG + 2) << 2) & 0xC) | 
            ((diffB + 2) & 0x3) & 0xFF;
    }

    private getLumaChunk(diffG: number, dRdG: number, dBdG: number) {
        return [
            ((ChunkType.QOI_OP_LUMA << 6) | ((diffG + 0x20) & 0x3F)), 
            (
                (((dRdG + 0x8) << 4) & 0xF0) | 
                (dBdG + 0x8) & 0xF
            ) & 0xFF
        ];
    }

    public override toBytes() {

        const output = new Array<number>();
        const header = this.getHeader();
        output.push(...header);

        let previous = Pixel.from(0, 0, 0, 0xFF);
        let run = 0;

        for (let i = 0; i < this.pixels.length; i++) {

            const current = this.pixels[i];
            
            if (current.equals(previous)) {
                run++;
                
                if (run === 62 || i === this.pixels.length - 1) {
                    output.push(this.getRunChunk(run));
                    run = 0;
                }
            } else {
                if (run > 0) {                    
                    output.push(this.getRunChunk(run));
                    run = 0;
                }

                const index = (current.R * 3 + current.G * 5 + current.B * 7 + current.A * 11) % 64;

                if (this.search[index]?.equals(current)) {
                    output.push(this.getIndexChunk(index));
                } else {

                    this.search[index] = current;

                    const diffR = current.R - previous.R;
                    const diffG = current.G - previous.G;
                    const diffB = current.B - previous.B;
                    const diffA = current.A - previous.A;

                    if (diffA === 0) {
                        if (diffR >= -2 && diffR <= 1 && 
                            diffG >= -2 && diffG <= 1 && 
                            diffB >= -2 && diffB <= 1) {
                            output.push(this.getDiffChunk(diffR, diffG, diffB));
                        } else {
                            const dRdG = diffR - diffG;
                            const dBdG = diffB - diffG;
                    
                            if (diffG >= -32 && diffG <= 31 &&
                                dRdG >= -8 && dRdG <= 7 &&
                                dBdG >= -8 && dBdG <= 7) {
                                output.push(...this.getLumaChunk(diffG, dRdG, dBdG));
                            } else {
                                output.push(...this.getRGBChunk(current));
                            }
                        }
                    } else {
                        output.push(...this.getRGBAChunk(current));
                    }
                }
            }

            previous = current;
        }

        for (let i = 0; i < 7; i++)
            output.push(0);

        output.push(1);
        return new Uint8Array(output);
    }

    public override get extension() {
        return ".qoi";
    }
}
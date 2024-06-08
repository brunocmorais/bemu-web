import { LittleEndian } from "../Util/LittleEndian";
import { Framebuffer } from "../Video/Framebuffer";
import { Image } from "./Image";

const bmpHeaderSize = 0xE;
const dibHeaderSize = 0x28;
const headerSize = bmpHeaderSize + dibHeaderSize;

export class Bitmap extends Image {
    
    public static from(framebuffer : Framebuffer) {
        
        const bitmap = new Bitmap(framebuffer.width, framebuffer.height);

        for (let j = 0; j < bitmap.height; j++)
            for (let i = 0; i < bitmap.width; i++)
                bitmap.set(i, j, framebuffer.get(i, j));

        return bitmap;
    }

    public override toBytes() {

        const bytes = new Array<number>();
        const uint = LittleEndian.get4BytesFromDWord;
        
        // BMP file header
        bytes.push(0x42, 0x4D);
        bytes.push(...uint(headerSize + (this.pixels.length * 4)));
        bytes.push(...uint(0));
        bytes.push(...uint(headerSize));

        // DIB header

        bytes.push(...uint(dibHeaderSize));
        bytes.push(...uint(this.width));
        bytes.push(...uint(this.height));
        bytes.push(1, 0);
        bytes.push(32, 0);
        bytes.push(...uint(0));
        bytes.push(...uint(this.pixels.length * 4));
        bytes.push(...uint(0x0B13));
        bytes.push(...uint(0x0B13));
        bytes.push(...uint(0));
        bytes.push(...uint(0));

        // Image data
        for (let j = this.height - 1; j >= 0; j--) {
            for (let i = 0; i < this.width; i++) {
                const pixel = this.get(i, j);
                bytes.push(pixel.B, pixel.G, pixel.R, pixel.A);
            }
        }

        return new Uint8Array(bytes);
    }

    public override get extension() {
        return ".bmp";
    }
}
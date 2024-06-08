import { Framebuffer } from "../Video/Framebuffer";
import { Bitmap } from "./Bitmap";
import { ImageType } from "./ImageType";
import { QOI } from "./QOI";

export class Factory {

    public static get(type: ImageType, framebuffer : Framebuffer) {

        switch (type) {
            case ImageType.BMP: return Bitmap.from(framebuffer);
            case ImageType.QOI: return QOI.from(framebuffer);
            default: throw new Error("Unimplemented image type!");
        }
    }
}
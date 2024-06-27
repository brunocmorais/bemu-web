import { MonochromePaletteType } from "./MonochromePaletteType";
import { Blue, Brown, Gray, Green, Kiosk, Light, LightGreen, Red, SuperGameboy, Yellow } from "./ColorPalettes";

export class Factory {

    public static get(paletteType : MonochromePaletteType) {

        switch (paletteType) {
            case MonochromePaletteType.gray: return new Gray();
            case MonochromePaletteType.lightGreen: return new LightGreen();
            case MonochromePaletteType.brown: return new Brown();
            case MonochromePaletteType.light: return new Light();
            case MonochromePaletteType.kiosk: return new Kiosk();
            case MonochromePaletteType.superGameboy: return new SuperGameboy();
            case MonochromePaletteType.green: return new Green();
            case MonochromePaletteType.yellow: return new Yellow();
            case MonochromePaletteType.red: return new Red();
            case MonochromePaletteType.blue: return new Blue();
            default: throw new Error("Unsupported palette type!");
        }
    }
}
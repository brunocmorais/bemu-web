import { Framebuffer } from "../Framebuffer";
import { _2xSaI } from "./2xSaI";
import { Bilinear } from "./Bilinear";
import { EPX } from "./EPX";
import { Eagle } from "./Eagle";
import { Empty } from "./Empty";
import { Filter } from "./Filter";
import { FilterType } from "./FilterType";
import { Nearest } from "./Nearest";
import { Scale2x } from "./Scale2x";
import { Scale3x } from "./Scale3x";
import { Super2xSaI } from "./Super2xSaI";
import { SuperEagle } from "./SuperEagle";

export class Factory {

    public static get(type : FilterType, framebuffer : Framebuffer) : Filter {

        switch (type) {
            case FilterType.None: return new Empty(framebuffer);
            case FilterType.Eagle: return new Eagle(framebuffer);
            case FilterType.EPX: return new EPX(framebuffer);
            case FilterType.Nearest: return new Nearest(framebuffer);
            case FilterType.Scale2x: return new Scale2x(framebuffer);
            case FilterType.Scale3x: return new Scale3x(framebuffer);
            case FilterType.Bilinear: return new Bilinear(framebuffer);
            case FilterType.SuperEagle: return new SuperEagle(framebuffer);
            case FilterType._2xSaI: return new _2xSaI(framebuffer);
            case FilterType.Super2xSaI: return new Super2xSaI(framebuffer);
        }
    }
}
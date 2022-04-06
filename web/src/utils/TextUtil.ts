import {Text, TextRect} from '../store/texts/types';
import { v4 as uuidv4 } from 'uuid';
import {IRect} from '../interfaces/IRect';
import { sample } from 'lodash';
import {Settings} from '../settings/Settings';

export class TextUtil {
    public static createText(name: string): Text {
        return {
            id: uuidv4(),
            name,
            color: sample(Settings.LABEL_COLORS_PALETTE)
        }
    }

    public static createTextRect(text: string, rect: IRect): TextRect {
        return {
            id: uuidv4(),
            text,
            rect
        }
    }
}

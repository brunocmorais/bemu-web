export class GamePad {

    private static pressedKeys : string[] = [];
    
    public static start() {
        document.onkeydown = GamePad.onKeyDown;
        document.onkeyup = GamePad.onKeyUp;
    }

    public static onKeyDown(event : KeyboardEvent) {
        if (GamePad.pressedKeys.indexOf(event.key) === -1)
            GamePad.pressedKeys.push(event.key);
    }

    public static onKeyUp(event : KeyboardEvent) {
        const index = GamePad.pressedKeys.indexOf(event.key);
        GamePad.pressedKeys.splice(index, 1);
    }

    public static get keys() {
        return [...GamePad.pressedKeys];
    }
}
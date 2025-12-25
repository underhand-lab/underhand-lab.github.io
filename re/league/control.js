import * as input from "./input.js"
import { PopUp } from "/src/ui/pop-up.js"
import { ToggleBox } from "/src/ui/toggle-box.js";

new ToggleBox(document.getElementById('batter-personal'),
    document.getElementById('open-batter-personal'), true);
new ToggleBox(document.getElementById('batter-league'),
    document.getElementById('open-batter-league'), true);
new ToggleBox(document.getElementById('runner-league'),
    document.getElementById('open-runner-league'), true);
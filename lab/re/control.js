import * as input from "./input.js"
import { PopUp } from "/src/ui/pop-up.js"
import { ToggleBox } from "/src/ui/toggle-box.js";

new ToggleBox(document.getElementById('runner-pop-up'),
    document.getElementById('open-runner-pop-up'), true);
new ToggleBox(document.getElementById('batter-pop-up'),
    document.getElementById('open-batter-pop-up'), true);

/*
new PopUp(document.getElementById('runner-pop-up'),
    document.getElementById('open-runner-pop-up'));

new PopUp(document.getElementById('batter-pop-up'),
    document.getElementById('open-batter-pop-up'));*/
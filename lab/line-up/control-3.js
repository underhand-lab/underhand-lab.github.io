import * as input from "./input.js";
import { ToggleBox } from "/src/ui/toggle-box.js";

const batterToggle = new ToggleBox(
    document.getElementById("batter-pop-up"), null, true);

new ToggleBox(document.getElementById("runner-pop-up"),
    document.getElementById('open-runner-pop-up'), true);
new ToggleBox(document.getElementById("line-up-pop-up"),
    document.getElementById('open-line-up-pop-up'), true);
new ToggleBox(document.getElementById("batter-list-pop-up"),
    document.getElementById('open-batter-list-pop-up'), true);

batterToggle.addCloseEvent(() => {
    input.setLineup();
    input.execute();
});
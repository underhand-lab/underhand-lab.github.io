import * as input from "./input.js";
import { ToggleBox } from "/src/ui/toggle-box.js";

const batterToggle = new ToggleBox(
    document.getElementById("batter-input"), null, true);

new ToggleBox(document.getElementById("runner-league-input"),
    document.getElementById('open-runner-league-input'), true);
new ToggleBox(document.getElementById("line-up-input"),
    document.getElementById('open-line-up-input'), true);
new ToggleBox(document.getElementById("batter-list-input"),
    document.getElementById('open-batter-list-input'), true);

batterToggle.addCloseEvent(() => {
    input.setLineup();
    input.execute();
});
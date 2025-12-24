import * as input from "./input.js"
import { PopUp } from "/src/ui/pop-up.js"

new PopUp(document.getElementById('runner-league-input'),
    document.getElementById('open-runner-league-input'));

const batter = new PopUp(document.getElementById('batter-input'),
    null);

new PopUp(document.getElementById('line-up-input'),
    document.getElementById('open-line-up-input'));

new PopUp(document.getElementById('batter-list-input'),
    document.getElementById('open-batter-list-input'));

batter.addCloseEvent(() => {
    input.setLineup();
    input.execute();
});
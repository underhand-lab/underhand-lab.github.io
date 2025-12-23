import * as input from "./input.js"
import { PopUp } from "/src/ui/pop-up.js"

new PopUp(document.getElementById('runner-pop-up'),
    document.getElementById('open-runner-pop-up'));

const batter = new PopUp(document.getElementById('batter-pop-up'),
    null);

new PopUp(document.getElementById('line-up-pop-up'),
    document.getElementById('open-line-up-pop-up'));

new PopUp(document.getElementById('batter-list-pop-up'),
    document.getElementById('open-batter-list-pop-up'));

batter.addCloseEvent(() => {
    input.setLineup();
    input.execute();
});
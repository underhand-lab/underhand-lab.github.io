import * as TransitionEngine from "/src/re/transition-engine/index.js";

import { calculateRE } from "./re-league.js";
import { setPersonalBatterInput, visualize } from "./visualize.js";

const batterInput = document.getElementById('batter-league');
const runnerInput = document.getElementById('runner-league');
const personalBatterInput = document.getElementById('batter-personal');

const transitionEngine = new TransitionEngine.Standard();

function execute() {

    const batterAbility = batterInput.getAbility();

    if (!batterAbility) return;

    const runnerAbility = runnerInput.getAbility();

    if (!runnerAbility) return;

    const ret = calculateRE(
        batterAbility, runnerAbility, transitionEngine);

    visualize(ret, batterInput, runnerAbility, transitionEngine);
    
}

batterInput.setEvent(execute);
runnerInput.setEvent(execute);

setPersonalBatterInput(personalBatterInput);
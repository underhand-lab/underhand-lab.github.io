import * as TransitionEngine from "/src/re/transition-engine/index.js";
import { BatterInput } from "/src/re/input/batter-input.js";
import { RunnerInput } from "/src/re/input/runner-input.js";

import { calculateRE } from "./re-league.js";
import { setPersonalBatterInput, visualize } from "./visualize.js";

const batterInput = new BatterInput();
const runnerInput = new RunnerInput();

const transitionEngine = new TransitionEngine.Standard();

function execute() {

    const batterAbility = batterInput.getAbility();
    const runnerAbility = runnerInput.getAbility();

    const ret = calculateRE(
        batterAbility, runnerAbility, transitionEngine);

    visualize(ret, batterInput, runnerAbility, transitionEngine);
    
}

batterInput.setDiv(document.getElementById('batter-league'), execute);
runnerInput.setDiv(document, execute);

const personalBatterInput = new BatterInput();
setPersonalBatterInput(personalBatterInput);

execute();
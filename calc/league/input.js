import * as TransitionEngine from "/src/re/transition-engine/index.js";
import { BatterInput } from "/src/re/input/batter-input.js";
import { RunnerInput } from "/src/re/input/runner-input.js";

import { calculateRE, getRunValue } from "./re-league.js";
import { visualize } from "./visualize.js";

const batterInput = new BatterInput();
const runnerInput = new RunnerInput();

const transitionEngine = new TransitionEngine.Standard();

function execute() {

    const batterAbility = batterInput.getAbility();
    const runnerAbility = runnerInput.getAbility();

    const ret = calculateRE(
        batterAbility, runnerAbility, transitionEngine);

    const labels = ['볼넷', '1루타', '2루타', '3루타', '홈런', '삼진', '뜬공', '땅볼'];
    const actions = ['bb', '1B', '2B', '3B', 'hr', 'so', 'fo', 'go'];

    const dataList = actions.reduce((acc, action, index) => {
        const value = getRunValue(action, runnerAbility, transitionEngine, ret.RE_data, ret.N_data);

        acc[action] = {
            name: labels[index],
            value: value
        };

        return acc;
    }, {});

    visualize(ret.RE_data, dataList, batterInput.getAbilityRaw());

}

batterInput.setDiv(document.getElementById('batter-league'), execute);
runnerInput.setDiv(document, execute);

execute();
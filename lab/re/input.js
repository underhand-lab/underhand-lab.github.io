import { calculateRE, getRunValue } from "./re-personal.js";
import { visualizeRE, visualizeRunValue } from "./visualize.js";

import { BatterInput } from "/src/re/input/batter-input.js";
import { RunnerInput } from "/src/re/input/runner-input.js";
import * as TransitionEngine from "/src/re/transition-engine/index.js";

import * as _ from "/src/module/import-html.js";

const batterInput = new BatterInput();
const runnerInput = new RunnerInput();

const transitionEngine = new TransitionEngine.Standard();

function execute() {

    const batterAbility = batterInput.getAbility();
    const runnerAbility = runnerInput.getAbility();

    const RE = calculateRE(
        batterAbility, runnerAbility, transitionEngine);

    document.getElementById('result').innerHTML =
        visualizeRE(RE);
        

    const labels = ['볼넷', '1루타', '2루타', '3루타', '홈런', '삼진', '뜬공', '땅볼'];
    const actions = ['bb', '1B', '2B', '3B', 'hr', 'so', 'fo', 'go'];

    // 1. 가치 데이터를 먼저 계산하여 배열에 저장
    let dataList = actions.map((action, index) => {
        const value = getRunValue(action, runnerAbility, transitionEngine, RE);
        return {
            label: labels[index],
            value: value
        };
    });

    document.getElementById('value').innerHTML =
        visualizeRunValue(dataList);

    document.getElementById('result-9re').innerHTML = `
            <div class="final-score" style="margin-top: 15px; font-size: 1.2em; font-weight: bold; color: #2c3e50;">
                <p>⚾ 9이닝당 리그 기대 득점:
                    <span style="color: #e74c3c;">
                        ${(RE[0][0] * 9).toFixed(3)}
                    </span>
                </p>
            </div>`;

}

batterInput.setDiv(document, execute);
runnerInput.setDiv(document, execute);

execute();
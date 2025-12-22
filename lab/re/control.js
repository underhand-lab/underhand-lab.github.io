import { calculateRE, getRunValue } from "./re-personal.js"
import { PopUp } from "/src/pop-up.js"
import { BatterInput } from "/src/re/input/batter-input.js"
import { RunnerInput } from "/src/re/input/runner-input.js"
import * as TransitionEngine from "/src/re/transition-engine/index.js";
/**
 * ----------------------------------------------------
 * 8. 시각화 (HTML 테이블 생성)
 * ----------------------------------------------------
 */
function visualizeRE(RE) {
    if (!RE) {
        // 오류 메시지는 solve_absorbing_chain_equation에서 이미 처리됨
        return "";
    }

    const runnserStates = [
        "주자 없음", "1루", "2루", "3루",
        "1, 2루", "1, 3루", "2, 3루", "만루"
    ];

    let html = `
        <table class="re-table">
            <thead>
                <tr>
                    <th>주자 상황</th>
                    <th>0 아웃</th>
                    <th>1 아웃</th>
                    <th>2 아웃</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let j = 0; j < 8; j++) {
        const re_0_out = RE[j][0].toFixed(3);
        const re_1_out = RE[j + 8][0].toFixed(3);
        const re_2_out = RE[j + 16][0].toFixed(3);

        html += `
            <tr>
                <td class="runner-state">${runnserStates[j]}</td>
                <td>${re_0_out}</td>
                <td>${re_1_out}</td>
                <td>${re_2_out}</td>
            </tr>
        `;
    }

    html += `
            </tbody>
        </table>
    `;

    return html;
}
function visualizeRunValue(RE, runnerAbility) {
    if (!RE) {
        // 오류 메시지는 solve_absorbing_chain_equation에서 이미 처리됨
        return "";
    }

    const label = ['볼넷', '1루타', '2루타', '3루타',
        '홈런', '삼진', '뜬공', '땅볼'];
    const list = ['bb', 'sh', 'dh', 'th', 'hr',
        'so', 'fb', 'gb'
    ];

    let html = `
        <table class="re-table">
            <thead>
                <tr>
                    <th>타구</th>
                    <th>가치</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let j = 0; j < 8; j++) {

        html += `
            <tr>
                <td class="runner-state">${label[j]}</td>
                <td>${getRunValue(list[j], runnerAbility, transitionEngine, RE).toFixed(3)}</td>
            </tr>
        `;
    }

    html += `
            </tbody>
        </table>
    `;

    return html;
}

const batterInput = new BatterInput();
const runnerInput = new RunnerInput();

const transitionEngine = new TransitionEngine.V1();

function execute() {

    const batterAbility = batterInput.getAbility();
    const runnerAbility = runnerInput.getAbility();

    const RE = calculateRE(
        batterAbility, runnerAbility, transitionEngine);

    document.getElementById('result').innerHTML =
        visualizeRE(RE);
    document.getElementById('value').innerHTML =
        visualizeRunValue(RE, runnerAbility);

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

new PopUp(document.getElementById('runner-pop-up'),
    document.getElementById('open-runner-pop-up'),
    document.getElementById('close-runner-pop-up'));

new PopUp(document.getElementById('batter-pop-up'),
    document.getElementById('open-batter-pop-up'),
    document.getElementById('close-batter-pop-up'));
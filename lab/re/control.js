import { calculate_run_expectancy } from "./run.js"
import { PopUp } from "/src/pop-up.js"
import { Batter } from "../batter.js"
import { Runner } from "../runner.js"

/**
 * ----------------------------------------------------
 * 8. 시각화 (HTML 테이블 생성)
 * ----------------------------------------------------
 */
function re_visualize(RE_results) {
    if (!RE_results) {
        // 오류 메시지는 solve_absorbing_chain_equation에서 이미 처리됨
        return "";
    }

    const runner_states = [
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
        const re_0_out = RE_results[j][0].toFixed(3);
        const re_1_out = RE_results[j + 8][0].toFixed(3);
        const re_2_out = RE_results[j + 16][0].toFixed(3);

        html += `
            <tr>
                <td class="runner-state">${runner_states[j]}</td>
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

    html += `
        <p>9이닝당 기대 득점: ${(RE_results[0][0] * 9).toFixed(3)}</p>
    `

    return html;
}

// HTML 버튼 클릭 시 호출되는 함수
function read_inputs_and_calculate(batter_ability, runner_ability) {

    const re_results = calculate_run_expectancy(batter_ability, runner_ability);

    document.getElementById('result').innerHTML = re_visualize(re_results);
}

const batter = new Batter();
const runner = new Runner();

function execute() {

    const batter_ability = batter.getAbility();
    const runner_ability = runner.getAbility();

    read_inputs_and_calculate(batter_ability, runner_ability);

}

batter.setDiv(document, execute);
runner.setDiv(document, execute);

execute();

new PopUp(document.getElementById('guide'),
    document.getElementById('open-guide-button'),
    document.getElementById('close-guide-button'));

new PopUp(document.getElementById('model-state'),
    document.getElementById('open-model-state-button'),
    document.getElementById('close-model-state-button'));

new PopUp(document.getElementById('model-run'),
    document.getElementById('open-model-run-button'),
    document.getElementById('close-model-run-button'));

new PopUp(document.getElementById('model-not'),
    document.getElementById('open-model-not-button'),
    document.getElementById('close-model-not-button'));
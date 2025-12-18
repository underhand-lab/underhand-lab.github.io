import * as Box from "/src/box/box.js";
import { calculate_lineup_re } from "./run.js"
import { Batter } from "../batter.js"
import { Runner } from "../runner.js"

function re_visualize(RE_results) {
    if (!RE_results) {
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
        const re_0_out = RE_results[j].toFixed(3);
        const re_1_out = RE_results[j + 8].toFixed(3);
        const re_2_out = RE_results[j + 16].toFixed(3);

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
        <p>9이닝당 기대 득점: ${(RE_results[0] * 9).toFixed(3)}</p>
    `

    return html;
}

const boxList = new Box.BoxList(document.getElementById("boxes"));
let players = [];
let lineup = [ 0 ];

function addBox(opt, batter, func, toBottom = true) {
    fetch(opt).then(response => {
        if (!response.ok) {
            throw new Error(`파일을 불러오는 데 실패했습니다: ${response.statusText}`);
        }
        return response.text();

    }).then((text) => {
        const box = boxList.addBox(text, () => {

        });
        box.className = 'container';
        func(box);
        players.push(batter);
        console.log(players);
        execute();
    }).catch(error => {
        console.error(`분석 도구 생성 중 오류가 발생했습니다.: ${error}`);
    });
}

const newBatter = new Batter();

addBox("./template/batter.html", newBatter, (box) => {
    newBatter.setDiv(box, execute);
});

const runner = new Runner();
runner.setDiv(document, execute);

function execute() {

    let input_lineup = [];

    for (let i = 0; i < 9; i++) {
        if (lineup.length <= i) {
            input_lineup.push((players[lineup[lineup.length - 1]]).getAbility());
            continue;
        }
        input_lineup.push((players[lineup[i]]).getAbility());
    }

    const runner_ability = runner.getAbility();

    const ret = calculate_lineup_re(input_lineup, runner_ability);

    console.log(ret);
    console.log(ret[0]);
    
    document.getElementById('result').innerHTML = re_visualize(ret[0]);

}
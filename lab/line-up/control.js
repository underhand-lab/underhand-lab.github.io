import * as Box from "/src/box/box.js";
import { calculate_lineup_re } from "./run.js"
import { Batter } from "../batter.js"
import { Runner } from "../runner.js"

function re_visualize(RE_results, idx) {
    if (!RE_results[idx]) {
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
        const re_0_out = RE_results[idx][j].toFixed(3);
        const re_1_out = RE_results[idx][j + 8].toFixed(3);
        const re_2_out = RE_results[idx][j + 16].toFixed(3);

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

    let re = 0;

    for (let i = 0; i < 9; i++) {
        re += RE_results[i][0];
    }
    
    html += `
        <p>9이닝당 기대 득점: ${(re).toFixed(3)}</p>
    `

    return html;
}

const boxList = new Box.BoxList(document.getElementById("boxes"));
let players = [];

const lineupBox = document.getElementById("line-up");

function setLineup() {
    let str = ''
    const default_batters = lineupBox.getElementsByTagName('select');
    for (let i = 0; i < 9; i++) {
        str += `<div><label>${i + 1}번타자</label>: `
        str += `<select>`;
        for (let j = 0; j < players.length; j++) {
            str += `<option value="${j}"`
            if (default_batters.length > i &&
                default_batters[i].value == j) {
                str += ` selected`;
            }
            str += `>${players[j].getName()}</option>`
        }
        str += `</select></div>`;
    }

    lineupBox.innerHTML = str;

    const batters = lineupBox.getElementsByTagName('select');

    for (let i = 0; i < batters.length; i++) {
        batters[i].addEventListener('change', () => {
            execute();
        });
    }
}

function addBox(opt, batter, func, toBottom = true) {
    return new Promise((resolve, reject) => {
        fetch(opt).then(response => {
            if (!response.ok) {
                throw new Error(`파일을 불러오는 데 실패했습니다: ${response.statusText}`);
            }
            return response.text();

        }).then((text) => {
            const box = boxList.addBox(text, () => {
                players = players.filter(p => p != batter);
                setLineup();
            });
            box.className = 'container';
            func(box);
            players.push(batter);
            console.log(players);
            setLineup();
            resolve();
        }).catch(error => {
            console.error(`분석 도구 생성 중 오류가 발생했습니다.: ${error}`);
            reject();
        });
    });

}

const runner = new Runner();

const startNumSelector = document.getElementById("start-num");
let ret;

function execute() {

    const batters = lineupBox.getElementsByTagName('select');
    let batters_ability = [];
    let input_lineup = [];

    for (let i = 0; i < players.length; i++) {
        batters_ability.push((players[i]).getAbility());
    }

    for (let i = 0; i < 9; i++) {
        input_lineup.push(batters_ability[batters[i].value]);
    }

    const runner_ability = runner.getAbility();

    ret = calculate_lineup_re(input_lineup, runner_ability);

    document.getElementById('result').innerHTML =
        re_visualize(ret, parseInt(startNumSelector.value));

}

startNumSelector.addEventListener('change', () => {
    document.getElementById('result').innerHTML =
        re_visualize(ret, parseInt(startNumSelector.value));

});

runner.setDiv(document, execute);

const addBatterBtn = document.getElementById("add-batter-btn");

function addBatter() {
    return new Promise((resolve, reject) => {
        const newBatter = new Batter();

        addBox("./template/batter.html", newBatter, (box) => {
            newBatter.setDiv(box, execute);
            newBatter.setName(`Player ${players.length}`);

            const playerName = box.getElementsByClassName("player-name")[0];
            playerName.value = newBatter.getName();
            playerName.addEventListener('change', () => {
                newBatter.setName(playerName.value);
                setLineup();
            });
        }).then(() => {
            resolve();

        });

    });

}

addBatterBtn.addEventListener('click', () => {
    addBatter();
})

addBatter().then(() => {
    execute();
});
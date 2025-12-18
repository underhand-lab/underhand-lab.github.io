import * as Box from "/src/box/box.js";
import { calculate_lineup_re } from "./run.js"
import { Batter } from "../batter.js"
import { Runner } from "../runner.js"
import { downloadCSV, readCSV } from "../download.js"

function re_visualize(RE_results, leadoff_vector, idx) {

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
    let sum = 0;

    for (let i = 0; i < 9; i++) {
        re += RE_results[i][0] * leadoff_vector[i];
        sum += leadoff_vector[i];
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
                if (players.length < 2) {
                    throw new Error(`선수가 1명 이상 필요합니다.`)
                }
                players = players.filter(p => p != batter);
            });
            func(box);
            players.push(batter);
            resolve();
        }).catch(error => {
            console.error(`분석 도구 생성 중 오류가 발생했습니다.: ${error}`);
            reject();
        });
    });

}

const runner = new Runner();

const startNumSelector = document.getElementById("start-num");
let ret
let pa_vector;
let leadoff_vector;

function getLineup(func) {

    const batters = lineupBox.getElementsByTagName('select');
    let batters_ability = [];
    let input_lineup = [];

    for (let i = 0; i < players.length; i++) {
        batters_ability.push(func(players[i]));
    }

    for (let i = 0; i < 9; i++) {
        input_lineup.push(Object.assign({},
            batters_ability[batters[i].value]));
    }

    return input_lineup;

}

function execute() {

    const input_lineup = getLineup((batter) => {
        return batter.getAbility()
    });
    const runner_ability = runner.getAbility();

    const retval = calculate_lineup_re(input_lineup, runner_ability);

    ret = retval['re'];
    pa_vector = retval['pa_vector']
    leadoff_vector = retval['leadoff_vector'];

    document.getElementById('result').innerHTML =
        re_visualize(ret, leadoff_vector, parseInt(startNumSelector.value));

}

startNumSelector.addEventListener('change', () => {
    document.getElementById('result').innerHTML =
        re_visualize(ret, leadoff_vector, parseInt(startNumSelector.value));

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
            setLineup();
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

const saveCSVBtn = document.getElementById("save-csv");
const readCSVBtn = document.getElementById("read-csv");

saveCSVBtn.addEventListener('click', () => {
    let lineup = getLineup((batter) => {
        return batter.getAbilityRaw()
    });

    let nameMap = {};

    for (let i = 0; i < 9; i++) {
        if ((lineup[i]['name']) in nameMap) {
            nameMap[lineup[i]['name']] += 1;
            lineup[i]['name'] = `${lineup[i]['name']}${nameMap[lineup[i]['name']]}`;
            continue;
        }
        nameMap[lineup[i]['name']] = 0;
    }
    /*
    */

    downloadCSV(lineup, 'line-up');
})

readCSVBtn.addEventListener('change', () => {

    readCSVBtn.files[0].text().then((csv) => {
        const playerObj = readCSV(csv);
        boxList.clear();
        players = []; // 전역 변수 초기화

        // 1. 9번의 addBox 비동기 작업을 담을 배열 생성
        const addBatterPromises = [];

        for (let i = 0; i < 9; i++) {
            const newBatter = new Batter();
            
            // addBox가 Promise를 반환하므로 이를 배열에 push
            const p = addBox("./template/batter.html", newBatter, (box) => {
                newBatter.setDiv(box, execute);
                newBatter.readJson(playerObj[i]);

                const playerName = box.getElementsByClassName("player-name")[0];
                playerName.value = newBatter.getName();
                playerName.addEventListener('change', () => {
                    newBatter.setName(playerName.value);
                    setLineup(); // 이름 변경 시 라인업 UI 갱신 (기존 함수 활용 권장)
                });
            });
            
            addBatterPromises.push(p);
        }

        // 2. 모든 addBox(비동기)가 끝날 때까지 대기
        Promise.all(addBatterPromises).then(() => {
            // 이제 모든 선수가 players 배열에 들어온 상태입니다.
            
            // 라인업 UI 생성 (기존에 작성하신 setLineup() 함수가 있다면 호출로 대체 가능)
            let str = '';
            for (let i = 0; i < 9; i++) {
                str += `<div><label>${i + 1}번타자</label>: <select>`;
                for (let j = 0; j < players.length; j++) {
                    str += `<option value="${j}" ${i === j ? 'selected' : ''}>${players[j].getName()}</option>`;
                }
                str += `</select></div>`;
            }
            lineupBox.innerHTML = str;

            // 이벤트 리스너 등록
            const batters = lineupBox.getElementsByTagName('select');
            for (let i = 0; i < batters.length; i++) {
                batters[i].addEventListener('change', execute);
            }

            // 모든 준비가 끝난 후 계산 실행
            execute();
        }).catch(err => {
            console.error("선수 데이터를 불러오는 중 오류 발생:", err);
        });
    });
});
import * as Box from "/src/box/box.js";
import { calculate_lineup_re } from "./run.js"
import { BatterInput } from "../batter-input.js"
import { RunnerInput } from "../runner-input.js"
import { downloadCSV, readCSV } from "../download.js"
import { re_visualize, leadoff_visualize, get9RE } from "./visualize.js";

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
                setLineup();
                execute();
            });
            box.style.position = 'relative';
            func(box);
            players.push(batter);
            resolve();
        }).catch(error => {
            console.error(`분석 도구 생성 중 오류가 발생했습니다.: ${error}`);
            reject();
        });
    });

}

const runner = new RunnerInput();

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
    leadoff_vector = retval['leadoff_vector'];

    const idx = parseInt(startNumSelector.value);

    document.getElementById('result-re').innerHTML =
        re_visualize(ret, idx);
    document.getElementById('result-leadoff').innerHTML =
        leadoff_visualize(leadoff_vector, idx);
    document.getElementById('result-9re').innerHTML =
        get9RE(ret, leadoff_vector, idx)

}

startNumSelector.addEventListener('change', () => {

    const idx = parseInt(startNumSelector.value);

    document.getElementById('result-re').innerHTML =
        re_visualize(ret, idx);
    document.getElementById('result-leadoff').innerHTML =
        leadoff_visualize(leadoff_vector, idx);
    document.getElementById('result-9re').innerHTML =
        get9RE(ret, leadoff_vector, idx)

});

runner.setDiv(document, execute);

const addBatterBtn = document.getElementById("add-batter-btn");

function addBatter(defaultName) {
    return new Promise((resolve, reject) => {
        const newBatter = new BatterInput();

        addBox("./template/batter.html", newBatter, (box) => {
            newBatter.setDiv(box, execute);

            let nextIdx = 0;
            let name = `${defaultName}`;

            while (players.some(p => p.getName() === name)) {
                name = `${defaultName} ${nextIdx}`;
                nextIdx++;
            }

            newBatter.setName(name);

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
    addBatter('Player');
})

addBatter('03 이승엽').then(() => {
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

        for (let i = 0; i < playerObj.length; i++) {
            const newBatter = new BatterInput();

            // addBox가 Promise를 반환하므로 이를 배열에 push
            const p = addBox("./template/batter.html", newBatter, (box) => {
                newBatter.setDiv(box, execute);
                newBatter.readJson(playerObj[i]);
                newBatter.setName(playerObj[i]['name']);

                const playerName = box.getElementsByClassName("player-name")[0];
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

const readBatterCSVBtn = document.getElementById("read-batter-csv");

readBatterCSVBtn.addEventListener('change', () => {

    readBatterCSVBtn.files[0].text().then((csv) => {
        const playerObj = readCSV(csv)[0];

        const newBatter = new BatterInput();

        // addBox가 Promise를 반환하므로 이를 배열에 push
        addBox("./template/batter.html", newBatter, (box) => {
            newBatter.setDiv(box, execute);
            newBatter.readJson(playerObj);
            newBatter.setName(playerObj['name']);

            const playerName = box.getElementsByClassName("player-name")[0];
            playerName.value = playerObj['name'];
            playerName.addEventListener('change', () => {
                newBatter.setName(playerName.value);
                setLineup();
            });
        }).then(() => {
            setLineup();
        });
    });

});
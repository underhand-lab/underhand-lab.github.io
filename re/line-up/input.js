import { BoxList } from "/src/ui/box-list.js";
import { calculateLineupRE } from "./re-line-up.js"
import { BatterInput } from "/src/re/input/batter-input.js"
import { RunnerInput } from "/src/re/input/runner-input.js"
import { downloadCSV, readCSV } from "/src/csv/download.js"
import { PlayerList } from "./line-up.js"
import { visualizeRE, visualizeLeadoff, get9RE } from "./visualize.js";

import * as _ from "/src/module/import-html.js";

const boxList = new BoxList(document.getElementById("boxes"));
const playerList = new PlayerList();
const lineupBox = document.getElementById("line-up");

export function setLineup() {

    let str = ''
    const default_batters = lineupBox.getElementsByTagName('select');
    const players = playerList.getAllPlayers();

    for (let i = 0; i < 9; i++) {
        str += `<div><label>${i + 1}번타자</label>: `
        str += `<select>`;
        for (let j = 0; j < players.length; j++) {
            str += `<option value="${j}"`
            if (default_batters.length > i &&
                default_batters[i].value == j) {
                str += ` selected`;
            }
            str += `>${players[j]['name']}</option>`
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

const batter = new BatterInput();
const runner = new RunnerInput();

let target;
let targetName;

let ret
let leadoff_vector;

function batterAbilityChanged() {
    const newValue = batter.getAbilityRaw();

    for (const key in newValue) {
        target[key] = newValue[key];
    }

    batter.getAbility();
    targetName.innerHTML = target['name'];

}

batter.setDiv(document, batterAbilityChanged);
runner.setDiv(document, execute);

const batterEditDiv = document.getElementById('batter-pop-up');
const devaultBatterAbility = batter.getAbilityRaw();

const startNumSelector = document.getElementById("start-num");

function getLineup(func) {

    const batters = lineupBox.getElementsByTagName('select');
    let inputLineup = [];

    for (let i = 0; i < 9; i++) {
        inputLineup.push(parseInt(batters[i].value));
    }

    return playerList.getLineup(
        inputLineup).map(
            ability => func(ability));

}

export function execute() {

    const input_lineup = getLineup((b) => {
        batter.readJson(b);
        return batter.getAbility()
    });

    const runner_ability = runner.getAbility();

    const retval = calculateLineupRE(input_lineup, runner_ability);

    ret = retval['re'];
    leadoff_vector = retval['leadoff_vector'];

    const idx = parseInt(startNumSelector.value);

    document.getElementById('result-re').innerHTML =
        visualizeRE(ret, idx);
    document.getElementById('result-leadoff').innerHTML =
        visualizeLeadoff(leadoff_vector, idx);
    document.getElementById('result-9re').innerHTML =
        get9RE(ret, leadoff_vector, idx);

}

const addBatterBtn = document.getElementById("add-batter-btn");

function addBatter(refAbility) {

    const newPlayer = Object.assign({}, refAbility);
    playerList.addPlayer(newPlayer, () => { });

    return new Promise((resolve, reject) => {
        boxList.addBoxTemplate("./template/batter-new.html", () => {
            playerList.removePlayer(newPlayer);
            setLineup();
            execute();
        }, (box)=> {
            box.style.position = 'relative';
            const playerName = box.getElementsByClassName('name')[0];
            playerName.innerHTML = newPlayer['name'];

            const btn = box.getElementsByClassName('edit-player')[0];
            btn.addEventListener('click', () => {
                target = newPlayer;
                targetName = playerName;
                batter.readJson(newPlayer);
                batterEditDiv.style.display = 'block';

            });
            
        }).then(() => {
            resolve();
        }).catch((error) => {
            console.error(`타자 생성 중 오류가 발생했습니다.: ${error}`);
            reject();
        });

    });
}

addBatterBtn.addEventListener('click', () => {
    addBatter(devaultBatterAbility).then(() => {
        setLineup();
        const scrollDiv = document.getElementById("boxes");
        scrollDiv.scrollTo({
            top: scrollDiv.scrollHeight,
                behavior: 'smooth' // 부드럽게 이동하고 싶을 때 추가
        });
    });
})

const start = Object.assign({},
    devaultBatterAbility);
start['name'] = '03 이승엽';

addBatter(start).then(() => {
    setLineup();
    execute();
});

const saveCSVBtn = document.getElementById("save-csv");

saveCSVBtn.addEventListener('click', () => {
    downloadCSV(playerList.getAllPlayers(), 'line-up');
});

const readBatterCSVBtn = document.getElementById("read-batter-csv");

readBatterCSVBtn.addEventListener('change', () => {

    readBatterCSVBtn.files[0].text().then((csv) => {
        const playerObjs = readCSV(csv);

        const addBatterPromises = [];

        for (let i = 0; i < playerObjs.length; i++) {
            const p = addBatter(playerObjs[i]);
            addBatterPromises.push(p);
        }
        Promise.all(addBatterPromises).then(() => {
            setLineup();
            const scrollDiv = document.getElementById("boxes");
            scrollDiv.scrollTo({
                top: scrollDiv.scrollHeight,
                    behavior: 'smooth' // 부드럽게 이동하고 싶을 때 추가
            });
            readBatterCSVBtn.value = "";
        });
    });

});
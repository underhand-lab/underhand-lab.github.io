import * as Box from "/src/box/box.js";
import { calculate_lineup_re } from "./run.js"
import { Batter } from "../batter.js"
import { Runner } from "../runner.js"
import { downloadCSV, readCSV } from "../download.js"
import { re_visualize, leadoff_visualize, get9RE } from "./visualize.js";
import { PopUp } from "/src/pop-up.js"

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

function addBox(opt, batter, func) {
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

const batter = new Batter();
const runner = new Runner();

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

    const input_lineup = getLineup((b) => {
        batter.readJson(b);
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

const addBatterBtn = document.getElementById("add-batter-btn");

function addBatter(default_ability) {
    return new Promise((resolve, reject) => {
        
        const new_value = Object.assign({}, default_ability);

        addBox("./template/batter-new.html", new_value, (box) => {
            let nextIdx = 0;
            let name = `${new_value['name']}`;

            while (players.some(p => p['name'] === name)) {
                name = `${new_value['name']} ${nextIdx}`;
                nextIdx++;
            }
            new_value['name'] = name;

            const playerName = box.getElementsByClassName('name')[0];
            playerName.innerHTML = name;
            
            const btn = box.getElementsByClassName('edit-player')[0];
            btn.addEventListener('click', ()=>{
                target = new_value;
                targetName = playerName;
                batter.readJson(new_value);
                batterEditDiv.style.display = 'block';
                
            });

        }).then(() => {
            setLineup();
            execute();
            resolve();
            
        });

    });

}

addBatterBtn.addEventListener('click', () => {
    addBatter(devaultBatterAbility);
})

const start = Object.assign({},
            devaultBatterAbility);
start['name'] = '03 이승엽'

addBatter(start);

new PopUp(document.getElementById('runner-pop-up'),
    document.getElementById('open-runner-pop-up'),
    document.getElementById('close-runner-pop-up'));
    
new PopUp(document.getElementById('batter-pop-up'),
    document.getElementById('open-batter-pop-up'),
    document.getElementById('close-batter-pop-up'));

new PopUp(document.getElementById('line-up-pop-up'),
    document.getElementById('open-line-up-pop-up'),
    document.getElementById('close-line-up-pop-up'));

new PopUp(document.getElementById('batter-list-pop-up'),
    document.getElementById('open-batter-list-pop-up'),
    document.getElementById('close-batter-list-pop-up'));

document.getElementById('close-batter-pop-up').
    addEventListener('click', () => {
        setLineup();
        execute();
    });
import { calculate_run_expectancy } from "./run.js"

const batter_ability_input_ratio = {
    'ba': document.getElementById('input_ratio_ba'),
    'out': document.getElementById('input_ratio_out'),

    'gb': document.getElementById('input_ratio_gb'),
    'fb': document.getElementById('input_ratio_fb'),

    'dh': document.getElementById('input_ratio_dh'),
    'th': document.getElementById('input_ratio_th'),
    'hr': document.getElementById('input_ratio_hr'),
}

const batter_ability_input_cumulative = {
    'bb': document.getElementById('input_cumulative_bb'),

    'so': document.getElementById('input_cumulative_so'),
    'gb': document.getElementById('input_cumulative_gb'),
    'fb': document.getElementById('input_cumulative_fb'),

    'dh': document.getElementById('input_cumulative_dh'),
    'th': document.getElementById('input_cumulative_th'),
    'hr': document.getElementById('input_cumulative_hr'),
    'sh': document.getElementById('input_cumulative_sh'),
}

const runner_ability_input = {
    'twohome': document.getElementById('input_ratio_twohome'),
    'twothree': document.getElementById('input_ratio_twothree'),

    'onethree': document.getElementById('input_ratio_onethree'),

    'sf': document.getElementById('input_ratio_sf'),
    'sfx_out': document.getElementById('input_ratio_sfx_out'),

    'dp2x': document.getElementById('input_ratio_dp2x'),
    'dp1x': document.getElementById('input_ratio_dp1x'),

}

function read_batter_ability_ratio() {
    // 타자 능력치 읽기
    const batter_ability = {};

    for (let key in batter_ability_input_ratio) {
        batter_ability[key] = parseFloat(
            batter_ability_input_ratio[key].value);
    }

    batter_ability['bb']
        = 1 - (batter_ability['ba'] + batter_ability['out']);

    batter_ability['sh']
        = batter_ability['ba'] - (batter_ability['dh']
            + batter_ability['th'] + batter_ability['hr']);

    batter_ability['so'] = batter_ability['out'] - 
        (batter_ability['gb'] + batter_ability['fb'])

    // 3. HTML에 반영
    document.getElementById('input_ratio_bb').value = batter_ability['bb'];
    document.getElementById('input_ratio_sh').value = batter_ability['sh'];
    document.getElementById('input_ratio_so').value = batter_ability['so'];
    
    return batter_ability;
}

function read_batter_ability_cumulative() {

    const batter_ability_raw = {};
    let pa = 0;

    for (let key in batter_ability_input_cumulative) {
        batter_ability_raw[key] = parseInt(
            batter_ability_input_cumulative[key].value);
        pa += batter_ability_raw[key];
    }

    const batter_ability = {
        'pa': pa,
        'bb': parseFloat(batter_ability_raw["bb"]) / pa,

        'so': parseFloat(batter_ability_raw["so"]) / pa,
        'gb': parseFloat(batter_ability_raw["gb"]) / pa,
        'fb': parseFloat(batter_ability_raw["fb"]) / pa,

        'sh': parseFloat(batter_ability_raw["sh"]) / pa,
        'dh': parseFloat(batter_ability_raw["dh"]) / pa,
        'th': parseFloat(batter_ability_raw["th"]) / pa,
        'hr': parseFloat(batter_ability_raw["hr"]) / pa,
    }

    document.getElementById('input_cumulative_pa').value
        = batter_ability["pa"];

    return batter_ability;
}

function read_runner_ability() {
    // 주자 능력치 읽기
    const runner_ability = {};

    for (let key in runner_ability_input) {
        runner_ability[key] = parseFloat(runner_ability_input[key].value);
    }

    runner_ability['sfx_stay'] = 1 -
        (runner_ability['sf'] + runner_ability['sfx_out']);
        
    runner_ability['twohomeout'] = 1 -
        (runner_ability['twothree'] + runner_ability['twohome'])

    document.getElementById('input_ratio_sfx_stay').value
        = runner_ability['sfx_stay'];
    document.getElementById('input_ratio_twohomeout').value
        = runner_ability['twohomeout'];

    return runner_ability;

}

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
        <p style="font-size: 0.9em; color: #666;">※ 기대 득점(RE): 해당 상황에서 이닝이 끝날 때까지 추가로 얻을 것으로 예상되는 평균 득점입니다.</p>
    `

    return html;
}

// HTML 버튼 클릭 시 호출되는 함수
function read_inputs_and_calculate(
    batter_ability, runner_ability) {

    const re_results = calculate_run_expectancy(batter_ability, runner_ability);

    document.getElementById('result').innerHTML = re_visualize(re_results);
}

function execute_1() {

    const batter_ability = read_batter_ability_ratio();
    const runner_ability = read_runner_ability();

    read_inputs_and_calculate(batter_ability, runner_ability);

}


function execute_2() {

    const batter_ability = read_batter_ability_cumulative();
    const runner_ability = read_runner_ability();

    read_inputs_and_calculate(batter_ability, runner_ability);

}

let execute;

const type = document.getElementById("type");
const input_form_1 = document.getElementById("input-form-1");
const input_form_2 = document.getElementById("input-form-2");


function execute_setting() {

    if (type && type.value == "1") {
        execute = execute_2;
        input_form_1.style.display = "none";
        input_form_2.style.display = "block";
        return;
    }

    execute = execute_1;
    input_form_1.style.display = "block";
    input_form_2.style.display = "none";

}

type.addEventListener('change', () => {
    execute_setting();
});

for (let key in batter_ability_input_ratio) {
    if (key == 'bb' || key == 'sh' || key == 'so')
        continue;

    batter_ability_input_ratio[key].addEventListener('change', () => {
        execute_1();
    });
}

for (let key in batter_ability_input_cumulative) {

    batter_ability_input_cumulative[key].addEventListener('change', () => {
        execute_2();
    });

}

for (let key in runner_ability_input) {
    if (key == 'sfx_stay' || key == 'twohomeout')
        continue;

    runner_ability_input[key].addEventListener('change', () => {
        execute();
    });
}

execute_setting();
execute();
import { calculate_run_expectancy } from "./run.js"

const type = document.getElementById("type");
const input_form_1 = document.getElementById("input-form-1");
const input_form_2 = document.getElementById("input-form-2");

const batter_ability_input = {
    'ba': document.getElementById('input_ratio_ba'),
    'out': document.getElementById('input_ratio_out'),
    'bb': document.getElementById('input_ratio_bb'),

    'so': document.getElementById('input_ratio_so'),
    'gb': document.getElementById('input_ratio_gb'),
    'fb': document.getElementById('input_ratio_fb'),

    'dh': document.getElementById('input_ratio_dh'),
    'th': document.getElementById('input_ratio_th'),
    'hr': document.getElementById('input_ratio_hr'),
    'sh': document.getElementById('input_ratio_sh'),
}

const runner_ability_input = {
    'twohome': document.getElementById('input_ratio_twohome'),
    'twohomeout': document.getElementById('input_ratio_twohomeout'),
    'twothree': document.getElementById('input_ratio_twothree'),

    'onethree': document.getElementById('input_ratio_onethree'),

    'sf': document.getElementById('input_ratio_sf'),
    'sfx_out': document.getElementById('input_ratio_sfx_out'),
    'sfx_stay': document.getElementById('input_ratio_sfx_stay'),

    'dp2x': document.getElementById('input_ratio_dp2x'),
    'dp1x': document.getElementById('input_ratio_dp1x'),

}

function read_inputs() {
    // 타자 능력치 읽기
    const batter_ability = {};

    for (let key in batter_ability_input) {
        batter_ability[key] = parseFloat(batter_ability_input[key].value);
    }

    // 주자 능력치 읽기
    const runner_ability = {};

    for (let key in runner_ability_input) {
        runner_ability[key] = parseFloat(runner_ability_input[key].value);
    }

    return { batter_ability, runner_ability };
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
        <p style="font-size: 0.9em; color: #666;">※ 기대 득점(RE): 해당 상황에서 이닝이 끝날 때까지 추가로 얻을 것으로 예상되는 평균 득점입니다.</p>
    `;

    return html;
}

// HTML 버튼 클릭 시 호출되는 함수
function read_inputs_and_calculate() {
    // 계산 전에 최종적으로 파생 확률을 업데이트하여 최신 값을 반영합니다.

    const { batter_ability, runner_ability } = read_inputs();
    const re_results = calculate_run_expectancy(batter_ability, runner_ability);

    document.getElementById('result').innerHTML = re_visualize(re_results);
}

function execute_1() {
    // 입력값 읽기 (유효한 숫자만)
    const ba = parseFloat(document.getElementById('input_ratio_ba').value) || 0;
    const out_pa = parseFloat(document.getElementById('input_ratio_out').value) || 0;
    const gb_out = parseFloat(document.getElementById('input_ratio_gb').value) || 0;
    const fb_out = parseFloat(document.getElementById('input_ratio_fb').value) || 0;
    const dh = parseFloat(document.getElementById('input_ratio_dh').value) || 0;
    const th = parseFloat(document.getElementById('input_ratio_th').value) || 0;
    const hr = parseFloat(document.getElementById('input_ratio_hr').value) || 0;

    let sh_bb = 1 - (ba + out_pa);

    // 1. 단타 확률 (SH/PA) 계산
    let sh_pa = ba - (dh + th + hr);
    if (sh_pa < 0) sh_pa = 0; // 최소 0

    // 2. 삼진 비율 (SO/OUT) 계산
    let so_out = out_pa - (gb_out + fb_out);
    if (so_out < 0) so_out = 0; // 최소 0

    // 3. HTML에 반영
    document.getElementById('input_ratio_bb').value = sh_bb;
    document.getElementById('input_ratio_sh').value = sh_pa;
    document.getElementById('input_ratio_so').value = so_out;

    const twothree = parseFloat(document.getElementById('input_ratio_twothree').value) || 0;    
    const twohome = parseFloat(document.getElementById('input_ratio_twohome').value) || 0;

    const sf = parseFloat(document.getElementById('input_ratio_sf').value) || 0;
    const sfx_out = parseFloat(document.getElementById('input_ratio_sfx_out').value) || 0;


    document.getElementById('input_ratio_sfx_stay').value = 1 - sf - sfx_out;
    document.getElementById('input_ratio_twohomeout').value = 1 - twothree - twohome;

    read_inputs_and_calculate();

}


function execute_2() {


}

for (let key in batter_ability_input) {
    if (key == 'bb' || key == 'sh' || key == 'so')
        continue;
    
    batter_ability_input[key].addEventListener('change', () => {
        if (type && type.value == "2") {
            execute_2();
            return;
        }
        execute_1();
    });
}

for (let key in runner_ability_input) {
    if (key == 'sfx_stay' || key == 'twohomeout')
        continue;
    console.log(key);

    runner_ability_input[key].addEventListener('change', () => {
        execute_1();
    });
}

execute_1();
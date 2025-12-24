import { BatterInput } from "/src/re/input/batter-input.js";

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

function visualizeRunValue(dataList) {
    if (!dataList) {
        return "";
    }

    // 1. 객체를 배열로 변환
    const sortedItems = Object.keys(dataList).map(key => ({
        label: key,
        ...dataList[key]
    }));

    // 2. value 기준 내림차순 정렬 (b.value - a.value)
    sortedItems.sort((a, b) => b.value - a.value);

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

    // 3. 정렬된 배열(sortedItems)로 HTML 생성
    for (const item of sortedItems) {
        html += `
        <tr>
            <td class="runner-state">${item.name}</td>
            <td>${item.value.toFixed(3)}</td>
        </tr>
    `;
    }

    html += `
        </tbody>
    </table>
`;

    return html;
}

function visualize9RE(RE) {
    return `
            <div class="final-score" style="margin-top: 15px; font-size: 1.2em; font-weight: bold; color: #2c3e50;">
                <p>⚾ 9이닝당 리그 기대 득점:
                    <span style="color: #e74c3c;">
                        ${(RE[0][0] * 9).toFixed(3)}
                    </span>
                </p>
            </div>`;

}

function calculateWeightedRunValue(reValues) {
    
    const avgOutRE = (reValues['so'].value + reValues['go'].value + reValues['fo'].value) / 3;

    return {
        bb: (reValues['bb'].value - avgOutRE),
        s1b: (reValues['1B'].value - avgOutRE),
        s2b: (reValues['2B'].value - avgOutRE),
        s3b: (reValues['3B'].value - avgOutRE),
        hr: (reValues['hr'].value - avgOutRE)
    };

}

function calculateCustomWOBA(weights, batterStats) {

    // 3. 분자 (Weighted Runs) 계산
    const weightedSum =
        (batterStats['bb'] * weights.bb) +
        (batterStats['1B'] * weights.s1b) +
        (batterStats['2B'] * weights.s2b) +
        (batterStats['3B'] * weights.s3b) +
        (batterStats['hr'] * weights.hr);

    // 4. 분모 (PA - Intentional BB 제외, 여기선 단순 PA 사용) 계산
    // 공식: AB + BB - IBB + SF + HBP
    const ab = batterStats['1B'] + batterStats['2B'] + batterStats['3B'] +
        batterStats['hr'] + batterStats['so'] + batterStats['go'] + batterStats['fo'];

    const pa = ab + batterStats['bb'] + batterStats['sf'];

    if (pa === 0) return 0;

    const wOBA = weightedSum / pa;

    return wOBA.toFixed(3);
}


const batterInput = new BatterInput();

function visualizeWOBA(runValue, leagueAbillity) {

    const weights = calculateWeightedRunValue(runValue);

    const wOBA = calculateCustomWOBA(
        weights, batterInput.getAbilityRaw());

    const wOBALeague = calculateCustomWOBA(
        weights, leagueAbillity);

    return `가중 출루율(wOBA): ${((wOBA / wOBALeague) * 0.33).toFixed(3)}`
}


let ret_RE;
let ret_runValue;
let ret_leagueAbility;

export function visualize(RE, runValue, leagueAbility) {

    ret_RE = RE;
    ret_runValue = runValue;
    ret_leagueAbility = leagueAbility;

    document.getElementById('result').innerHTML =
        visualizeRE(RE);

    document.getElementById('value').innerHTML =
        visualizeRunValue(runValue);

    document.getElementById('result-9re').innerHTML =
        visualize9RE(RE);

    document.getElementById('personal-woba').innerHTML
        = visualizeWOBA(ret_runValue, ret_leagueAbility);
}

batterInput.setDiv(document.getElementById('batter-personal'), () => {
    document.getElementById('personal-woba').innerHTML
        = visualizeWOBA(ret_runValue, ret_leagueAbility);
});
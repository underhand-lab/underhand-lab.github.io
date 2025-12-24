import { calculate_markov_core } from "/src/re/RE.js";


const stateManager = {
    getIndex(abilities_len, b_idx, out, b3, b2, b1) {
        if (out >= 3) return abilities_len * 24; // 흡수 상태 (이닝 종료)
        // 타자 수에 따라 24 또는 216 상태로 자동 매핑
        return (b_idx * 24) + (out * 8) + (b3 * 4) + (b2 * 2) + b1;
    },

    reverseState(idx) {
        const b_idx = Math.floor(idx / 24);
        const rem = idx % 24;
        const out = Math.floor(rem / 8);
        const b_rem = rem % 8;
        const b3 = Math.floor(b_rem / 4);
        const b2 = Math.floor((b_rem % 4) / 2);
        const b1 = b_rem % 2;
        return [b_idx, out, b3, b2, b1];
    }
};

export function calculateRE(
    batterAbility, runnerAbility, transitionEngine) {

    return calculate_markov_core([batterAbility], runnerAbility,
            stateManager, transitionEngine);

}
function getSituationWeights(N_data, L) {
    // 1번 타자(0), 0아웃, 무주자 상태에서 시작하는 행을 찾습니다.
    // N_data[i][j]는 i에서 시작해 j에 머무는 횟수의 기댓값입니다.
    const startNodeIdx = 0; // 보통 첫 번째 상태가 0아웃 무주자입니다.
    const expectedVisits = N_data[startNodeIdx];

    let situationWeights = Array(24).fill(0);
    for (let j = 0; j < expectedVisits.length; j++) {
        const situationIdx = j % 24; // 타순을 무시하고 24개 상황으로 압축
        situationWeights[situationIdx] += expectedVisits[j];
    }

    // 전체 합으로 나누어 비중(Probability)으로 변환
    const total = situationWeights.reduce((a, b) => a + b, 0);
    return situationWeights.map(v => v / total);
}

/**
 * 2. 빈도가 반영된 각 액션의 리그 평균 Run Value를 계산합니다.
 */
export function getRunValue(action, runnerAbility, engine,
    RE_data, N_data) {
    let totalWeightedValue = 0;
    const weights = getSituationWeights(N_data, 1);

    for (let i = 0; i < 24; i++) {
        // 상황별 전이 결과 가져오기
        const state = stateManager.reverseState(i);
        const stateObj = { out: state[1], b3: state[2], b2: state[3], b1: state[4] };
        const transitions = engine.getTransitions(action, stateObj, runnerAbility);

        // 해당 상황에서의 RE24 가치 계산
        let actionValue = 0;
        const RE_before = RE_data[i][0];

        for (const t of transitions) {
            const nextOut = stateObj.out + t.outDelta;
            const nextIdx = stateManager.getIndex(0, 0, nextOut, t.bases[2], t.bases[1], t.bases[0]);
            const RE_after = (nextOut < 3) ? RE_data[nextIdx][0] : 0;
            
            actionValue += t.prob * ((RE_after - RE_before) + t.runs);
        }

        // 상황 발생 빈도(weights)를 곱해서 누적
        totalWeightedValue += actionValue * weights[i];
    }

    return totalWeightedValue;
}
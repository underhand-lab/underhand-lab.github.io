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

    const { P_full, N_data, RE_data, L } =
        calculate_markov_core([batterAbility], runnerAbility,
            stateManager, transitionEngine);

    return RE_data;

}

function calculateActionValue(stateIdx, action,
    transitions, RE_data) {
    const [b, out, b3, b2, b1] = stateManager.reverseState(stateIdx);
    const RE_before = RE_data[stateIdx][0];

    let actionValue = 0;

    // 해당 액션 내의 모든 전이 확률(t.prob)을 고려하여 기댓값 합산
    for (const t of transitions) {
        const nextOut = out + t.outDelta;
        const nextIdx = stateManager.getIndex(
            0,
            0,
            nextOut,
            t.bases[2], // b3
            t.bases[1], // b2
            t.bases[0]  // b1
        );

        // 이닝 종료(3아웃) 시 RE_after는 0점
        const RE_after = (nextOut < 3) ? RE_data[nextIdx][0] : 0;

        // RE24 공식: (RE_after - RE_before) + 즉시득점
        const value = (RE_after - RE_before) + t.runs;

        // 전이 확률을 곱해서 합산 (예: GB 내의 병살/야선 확률 등 반영)
        actionValue += t.prob * value;
    }

    return actionValue;
}

export function getRunValue(
    action, runnerAbility, transitionEngine, RE_data) {
    let totalValue = 0;
    let stateCount = 24;

    // 24개 모든 주자/아웃 상황에서 해당 액션의 가치를 합산하여 평균냄
    // (실제로는 상황별 발생 빈도를 곱해야 더 정확하지만, 여기서는 산술평균 예시)
    for (let i = 0; i < stateCount; i++) {
        const state = stateManager.reverseState(i);
        const stateObj = { out: state[1], b3: state[2], b2: state[3], b1: state[4] };

        if ((action == 'fo' || action == 'go')) {
        const transitions = transitionEngine.getTransitions(
            action, stateObj, runnerAbility);
            console.log(action + ":" + calculateActionValue(i, action, transitions, RE_data));
        }

        const transitions = transitionEngine.getTransitions(
            action, stateObj, runnerAbility);
        totalValue += calculateActionValue(
            i, action, transitions, RE_data);
    }

    return totalValue / stateCount;
}
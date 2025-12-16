function solve_absorbing_chain_equation(P_matrix_25x25, R_immediate_24x1) {
    const N = 24;

    try {
        if (typeof math === 'undefined' || typeof math.inv !== 'function') {
            document.getElementById('result-container').innerHTML = "<h3>⚠️ 오류: Math.js 라이브러리가 로드되지 않았습니다.</h3>";
            return null;
        }

        // 1. Q 행렬 (24x24) 추출
        const Q_array = P_matrix_25x25.slice(0, N).map(row => row.slice(0, N));
        const Q = math.matrix(Q_array);

        // 2. 단위 행렬 I (24x24) 생성
        const I = math.identity(N);

        // 3. I - Q 계산
        const I_minus_Q = math.subtract(I, Q);

        // 4. (I - Q)의 역행렬 (Fundamental Matrix N) 계산: N = (I - Q)^-1
        const N_matrix = math.inv(I_minus_Q);

        // 5. R_immediate 벡터 (24x1)를 Math.js Matrix로 변환
        const R_matrix = math.matrix(R_immediate_24x1);

        // 6. 기대 득점 계산: RE = N * R (행렬 곱셈)
        const RE_matrix = math.multiply(N_matrix, R_matrix);

        // 결과를 JS 2차원 배열로 변환하여 반환
        return RE_matrix.toArray();

    } catch (e) {
        console.error("⚠️ 경고: 행렬 계산 중 Math.js 오류가 발생했습니다. 특이 행렬이거나 초기화 오류일 수 있습니다.", e);
        document.getElementById('result-container').innerHTML = `<h3>⚠️ 계산 오류 발생</h3><p>입력된 확률 값들을 확인해주세요. 행렬 (I-Q)가 역행렬을 가지지 못할 수 있습니다. (오류: ${e.message})</p>`;
        return null;
    }
}


const STATE_MAP = {};
const REVERSE_STATE_MAP = {};

let count = 0;

// 3 아웃까지의 모든 (out, b3, b2, b1) 조합을 인덱싱
for (let out = 0; out < 3; out++) {
    for (let b3 = 0; b3 < 2; b3++) {
        for (let b2 = 0; b2 < 2; b2++) {
            for (let b1 = 0; b1 < 2; b1++) {
                const state = [out, b3, b2, b1];
                STATE_MAP[state.join(',')] = count;
                REVERSE_STATE_MAP[count] = state;
                count++;
            }
        }
    }
}

function get_state_index(out, b3, b2, b1) {
    if (out === 3) {
        return 24; // 3 아웃은 흡수 상태 (24번 인덱스)
    }
    const state_key = [out, b3, b2, b1].join(',');
    return STATE_MAP[state_key] !== undefined ? STATE_MAP[state_key] : 24;
}

/**
 * ----------------------------------------------------
 * 3. 전이 행렬 P 생성
 * ----------------------------------------------------
 */
function create_transition_matrix_P(vars, runner_ability) {
    const P = Array(25).fill(0).map(() => Array(25).fill(0));

    for (let i = 0; i < 24; i++) {
        const [out_i, b3_i, b2_i, b1_i] = REVERSE_STATE_MAP[i];
        const next_out = out_i + 1;

        // 1. 볼넷 (BB)
        let new_b1 = 1;
        let new_b2 = b2_i;
        let new_b3 = b3_i;
        if (b1_i === 1) {
            if (b2_i === 0) { new_b2 = 1; new_b3 = b3_i; }
            else if (b3_i === 0) { new_b2 = 1; new_b3 = 1; }
            /* else { runs_bb = 1; } // 득점은 R_immediate에서 처리 */
        }
        P[i][get_state_index(out_i, new_b3, new_b2, new_b1)] += vars['bb'];

        // 2. 아웃 결과 (SO, FB, GB) 전이
        // 2A. 삼진 (so)
        if (out_i < 2) { P[i][get_state_index(next_out, b3_i, b2_i, b1_i)] += vars['so']; }
        else { P[i][24] += vars['so']; }

        // 2B. 뜬공 아웃 (fb)
        const P_FB = vars['fb'];
        if (b3_i === 1 && out_i < 2) {
            const P_SFX_STAY = P_FB * runner_ability['sfx_stay'];
            P[i][get_state_index(next_out, 1, b2_i, b1_i)] += P_SFX_STAY;
            const P_SF = P_FB * runner_ability['sf'];
            P[i][get_state_index(next_out, 0, b2_i, b1_i)] += P_SF;
            const P_SFX_OUT = P_FB * runner_ability['sfx_out'];
            if (out_i === 1) { P[i][24] += P_SFX_OUT; }
            else { P[i][get_state_index(out_i + 2, 0, b2_i, b1_i)] += P_SFX_OUT; }
        } else {
            if (out_i < 2) { P[i][get_state_index(next_out, b3_i, b2_i, b1_i)] += P_FB; }
            else { P[i][24] += P_FB; }
        }

        // 2C. 땅볼 아웃 (gb)
        const P_GB = vars['gb'];
        if (P_GB > 0 && b1_i === 1 && out_i < 2) {
            const P_DP2X = P_GB * runner_ability['dp2x'];
            const P_DP1X = P_GB * runner_ability['dp1x'];
            const P_GB_REMAINING = P_GB - P_DP2X - P_DP1X;

            // 병살 전이
            const dp2x_b3 = b2_i; const dp2x_b2 = 0; const dp2x_b1 = 1;
            P[i][get_state_index(next_out, dp2x_b3, dp2x_b2, dp2x_b1)] += P_DP2X;
            const dp1x_b3 = b2_i; const dp1x_b2 = 1; const dp1x_b1 = 0;
            P[i][get_state_index(next_out, dp1x_b3, dp1x_b2, dp1x_b1)] += P_DP1X;

            // 일반적인 병살
            const P_DP_NORMAL = P_GB_REMAINING;
            if (out_i === 1) { P[i][24] += P_DP_NORMAL; }
            else { P[i][get_state_index(out_i + 2, b3_i, b2_i, 0)] += P_DP_NORMAL; }
        } else if (out_i < 2) {
            // 일반 땅볼
            const gb_new_b1 = 0; const gb_new_b2 = b1_i; const gb_new_b3 = b2_i;
            P[i][get_state_index(next_out, gb_new_b3, gb_new_b2, gb_new_b1)] += P_GB;
        } else { P[i][24] += P_GB; } // 2사 후 땅볼 아웃

        // 3. 안타 (SH, DH, TH, HR) 전이
        const P_SH = vars['sh'];
        P[i][get_state_index(out_i, 0, 0, 0)] += vars['hr']; // HR: All empty
        P[i][get_state_index(out_i, 1, 0, 0)] += vars['th']; // TH: Runner at 3B
        P[i][get_state_index(out_i, b1_i, 1, 0)] += vars['dh']; // DH: Runner at 2B

        if (P_SH > 0) {
            if (b2_i === 1) { // 주자 2루 있을 때
                P[i][get_state_index(out_i, 0, b1_i, 1)] += P_SH * runner_ability['twohome'];
                if (out_i < 2) { P[i][get_state_index(out_i + 1, 0, b1_i, 1)] += P_SH * runner_ability['twohomeout']; }
                else { P[i][24] += P_SH * runner_ability['twohomeout']; }
                P[i][get_state_index(out_i, 1, b1_i, 1)] += P_SH * runner_ability['twothree'];
            } else if (b1_i === 1) { // 주자 1루만 있을 때
                P[i][get_state_index(out_i, 1, 0, 1)] += P_SH * runner_ability['onethree'];
                P[i][get_state_index(out_i, 0, 1, 1)] += P_SH * (1 - runner_ability['onethree']);
            } else { P[i][get_state_index(out_i, 0, 0, 1)] += P_SH; } // 주자 없을 때
        }
    }
    P[24][24] = 1.0; // 흡수 상태는 자기 자신으로 전이
    return P;
}

/**
 * ----------------------------------------------------
 * 4. 즉시 득점 벡터 R_immediate 생성
 * ----------------------------------------------------
 */
function create_immediate_runs_R(vars, runner_ability) {
    const R_immediate = Array(24).fill(0).map(() => [0]);

    for (let i = 0; i < 24; i++) {
        const [out_i, b3_i, b2_i, b1_i] = REVERSE_STATE_MAP[i];
        let runs = 0;

        // 1. 볼넷 (BB) - 밀어내기 득점
        if (b1_i === 1 && b2_i === 1 && b3_i === 1) { runs += vars['bb'] * 1; }

        // 2. 땅볼 아웃 (GB) - 3루 주자 득점 (내야 땅볼로 인한 득점)
        const P_GB = vars['gb'];
        if (b3_i === 1 && out_i < 2) {
            if (b1_i === 1) {
                const P_DP2X = P_GB * runner_ability['dp2x'];
                const P_DP1X = P_GB * runner_ability['dp1x'];
                const P_GB_REMAINING = P_GB - P_DP2X - P_DP1X;
                runs += P_DP2X * 1;
                runs += P_DP1X * 1;
                if (out_i === 0) { runs += P_GB_REMAINING * 1; }
            } else { runs += P_GB * 1; }
        }

        // 3. 뜬공 아웃 (FB) - 희생 플라이 득점
        const P_FB = vars['fb'];
        if (b3_i === 1 && out_i < 2) {
            const P_SF = P_FB * runner_ability['sf'];
            runs += P_SF * 1;
        }

        // 4. 안타 (SH, DH, TH, HR) - 즉시 득점
        runs += vars['hr'] * (1 + b1_i + b2_i + b3_i);
        runs += vars['th'] * (b1_i + b2_i + b3_i);
        runs += vars['dh'] * (b2_i + b3_i);

        const P_SH = vars['sh'];
        if (P_SH > 0) {
            const runs_from_3B = b3_i * 1;
            const runs_from_2B = b2_i * runner_ability['twohome'];
            runs += P_SH * (runs_from_3B + runs_from_2B);
        }

        R_immediate[i][0] = runs;
    }
    return R_immediate;
}

/**
 * ----------------------------------------------------
 * 6. 메인 계산 함수
 * ----------------------------------------------------
 */
export function calculate_run_expectancy(batter_ability, runner_ability) {

    const P_matrix = create_transition_matrix_P(
        batter_ability, runner_ability);
    const R_immediate = create_immediate_runs_R(
        batter_ability, runner_ability);

    return solve_absorbing_chain_equation(P_matrix, R_immediate);
}
/**
 * 9인 라인업 반영 기대 득점 계산기
 */

// 1. 상태 맵 생성 (9 타자 * 3 아웃 * 8 주자 상황 = 216 상태 + 1 흡수상태)
const STATE_MAP = {};
const REVERSE_STATE_MAP = {};
let count = 0;

for (let b_idx = 0; b_idx < 9; b_idx++) { // 타자 순서 (0~8)
    for (let out = 0; out < 3; out++) {
        for (let b3 = 0; b3 < 2; b3++) {
            for (let b2 = 0; b2 < 2; b2++) {
                for (let b1 = 0; b1 < 2; b1++) {
                    const state = [b_idx, out, b3, b2, b1];
                    STATE_MAP[state.join(',')] = count;
                    REVERSE_STATE_MAP[count] = state;
                    count++;
                }
            }
        }
    }
}
const ABSORBING_STATE = 216; // 3아웃 (이닝 종료)

function get_state_index(b_idx, out, b3, b2, b1) {
    if (out >= 3) return ABSORBING_STATE;
    const key = [b_idx % 9, out, b3, b2, b1].join(',');
    return STATE_MAP[key];
}

/**
 * 전이 행렬 P 및 즉시 득점 벡터 R 생성
 */
function create_matrices(lineup_vars, runner_ability) {
    const P = Array(217).fill(0).map(() => Array(217).fill(0));
    const R = Array(216).fill(0).map(() => [0]);

    for (let i = 0; i < 216; i++) {
        const [b_i, out_i, b3_i, b2_i, b1_i] = REVERSE_STATE_MAP[i];
        const vars = lineup_vars[b_i]; // 현재 타석에 들어선 타자의 능력치
        const next_b = (b_i + 1) % 9;  // 다음 타자 인덱스
        const next_out = out_i + 1;

        // --- 1. 볼넷 (BB) ---
        let bb_b1 = 1, bb_b2 = b2_i, bb_b3 = b3_i;
        if (b1_i === 1) {
            if (b2_i === 1) {
                if (b3_i === 1) R[i][0] += vars['bb'] * 1; // 밀어내기
                else bb_b3 = 1;
            } else bb_b2 = 1;
        }
        P[i][get_state_index(next_b, out_i, bb_b3, bb_b2, bb_b1)] += vars['bb'];

        // --- 2. 삼진 (SO) ---
        P[i][get_state_index(next_b, next_out, b3_i, b2_i, b1_i)] += vars['so'];

        // --- 3. 뜬공 (FB) ---
        if (b3_i === 1 && out_i < 2) {
            P[i][get_state_index(next_b, next_out, 1, b2_i, b1_i)] += vars['fb'] * runner_ability['sfx_stay'];
            P[i][get_state_index(next_b, next_out, 0, b2_i, b1_i)] += vars['fb'] * runner_ability['sf'];
            R[i][0] += vars['fb'] * runner_ability['sf'] * 1;
            P[i][get_state_index(next_b, out_i + 2, 0, b2_i, b1_i)] += vars['fb'] * runner_ability['sfx_out'];
        } else {
            P[i][get_state_index(next_b, next_out, b3_i, b2_i, b1_i)] += vars['fb'];
        }

        // --- 4. 땅볼 (GB) ---
        const p_gb = vars['gb'];
        if (p_gb > 0) {
            if (b1_i === 1 && out_i < 2) { // 병살 코스
                const p_dp_normal = p_gb * (1 - runner_ability['dp2x'] - runner_ability['dp1x']);
                P[i][get_state_index(next_b, next_out, b2_i, 0, 1)] += p_gb * runner_ability['dp2x'];
                P[i][get_state_index(next_b, next_out, b2_i, 1, 0)] += p_gb * runner_ability['dp1x'];
                if (b3_i === 1) R[i][0] += p_gb * (runner_ability['dp2x'] + runner_ability['dp1x']);

                P[i][get_state_index(next_b, out_i + 2, b3_i, b2_i, 0)] += p_dp_normal; // 일반 병살
            } else {
                P[i][get_state_index(next_b, next_out, b2_i, b1_i, 0)] += p_gb;
                if (b3_i === 1 && out_i < 2) R[i][0] += p_gb * 1;
            }
        }

        // --- 5. 안타류 (SH, DH, TH, HR) ---
        // 홈런
        P[i][get_state_index(next_b, out_i, 0, 0, 0)] += vars['hr'];
        R[i][0] += vars['hr'] * (1 + b1_i + b2_i + b3_i);

        // 3루타
        P[i][get_state_index(next_b, out_i, 1, 0, 0)] += vars['th'];
        R[i][0] += vars['th'] * (b1_i + b2_i + b3_i);

        // 2루타
        P[i][get_state_index(next_b, out_i, b1_i, 1, 0)] += vars['dh'];
        R[i][0] += vars['dh'] * (b2_i + b3_i);

        // 단타
        const p_sh = vars['sh'];
        if (p_sh > 0) {
            const r_3b = b3_i * 1;
            const r_2b = b2_i * runner_ability['twohome'];
            R[i][0] += p_sh * (r_3b + r_2b);

            // 주자 이동
            if (b2_i === 1) {
                P[i][get_state_index(next_b, out_i, 0, b1_i, 1)] += p_sh * runner_ability['twohome'];
                P[i][get_state_index(next_b, next_out, 0, b1_i, 1)] += p_sh * runner_ability['twohomeout'];
                P[i][get_state_index(next_b, out_i, 1, b1_i, 1)] += p_sh * runner_ability['twothree'];
            } else if (b1_i === 1) {
                P[i][get_state_index(next_b, out_i, 1, 0, 1)] += p_sh * runner_ability['onethree'];
                P[i][get_state_index(next_b, out_i, 0, 1, 1)] += p_sh * (1 - runner_ability['onethree']);
            } else {
                P[i][get_state_index(next_b, out_i, 0, 0, 1)] += p_sh;
            }
        }
    }
    P[216][216] = 1.0;
    return { P, R };
}

/**
 * 흡수 마르코프 체인 방정식 풀이
 */
function solve(P_full, R_vec) {
    const N_size = 216;
    const Q_array = P_full.slice(0, N_size).map(row => row.slice(0, N_size));

    const I = math.identity(N_size);
    const Q = math.matrix(Q_array);
    const R = math.matrix(R_vec);

    // N = (I - Q)^-1
    const fundamental_matrix = math.inv(math.subtract(I, Q));

    // RE = N * R
    const RE = math.multiply(fundamental_matrix, R).toArray();
    // --- 사용자님이 원하시는 9개 핵심 결과 추출 ---
    const ret = [];
    for (let b = 0; b < 9; b++) {
        const batter_situations = [];

        // 야구의 24가지 상황 (3아웃 * 8개 주자 상황)
        for (let out = 0; out < 3; out++) {
            for (let b3 = 0; b3 < 2; b3++) {
                for (let b2 = 0; b2 < 2; b2++) {
                    for (let b1 = 0; b1 < 2; b1++) {
                        // 해당 타자의 특정 상황 인덱스 계산
                        const idx = get_state_index(b, out, b3, b2, b1);
                        batter_situations.push(RE[idx][0]);
                    }
                }
            }
        }
        // ret[b]에 x+1번 타자의 24개 상황 배열을 저장
        ret[b] = batter_situations;
    }
    
    return ret;
}

/**
 * 메인 실행 함수
 * @param {Array} lineup_abilities - 9명 타자의 vars 객체 배열
 * @param {Object} runner_ability - 주자 기동력 공통 옵션
 */
export function calculate_lineup_re(lineup_abilities, runner_ability) {
    const { P, R } = create_matrices(lineup_abilities, runner_ability);
    return solve(P, R);
}
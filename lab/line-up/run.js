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
/**
 * 흡수 마르코프 체인 및 이닝 전이 로직을 이용한 통합 분석 함수
 */
function solve(P_full, R_vec) {
    const N_size = 216;
    const Q_array = P_full.slice(0, N_size).map(row => row.slice(0, N_size));

    const I = math.identity(N_size);
    const Q = math.matrix(Q_array);
    const R = math.matrix(R_vec);

    // 1. 기초 행렬 N = (I - Q)^-1 계산 (이닝 내 평균 방문 횟수)
    const fundamental_matrix = math.inv(math.subtract(I, Q));
    const N_data = fundamental_matrix.toArray();

    // 2. 상황별 기대 득점 RE = N * R
    const RE_matrix = math.multiply(fundamental_matrix, R);
    const RE_data = RE_matrix.toArray();

    // --- [A] 기존 출력용: 타자별 24개 상황 RE 추출 ---
    const situational_re = [];
    for (let b = 0; b < 9; b++) {
        const batter_situations = [];
        for (let out = 0; out < 3; out++) {
            for (let b3 = 0; b3 < 2; b3++) {
                for (let b2 = 0; b2 < 2; b2++) {
                    for (let b1 = 0; b1 < 2; b1++) {
                        const idx = get_state_index(b, out, b3, b2, b1);
                        batter_situations.push(RE_data[idx][0]);
                    }
                }
            }
        }
        situational_re[b] = batter_situations;
    }

    // --- [B] 이닝 전이 행렬 (Inning Transition Matrix) T 생성 ---
    // T[i][j]: i번 타자가 이닝을 시작했을 때, 다음 이닝을 j번 타자가 시작할 확률
    const T = Array(9).fill(0).map(() => Array(9).fill(0));
    
    for (let b = 0; b < 9; b++) {
        const start_node_for_b = get_state_index(b, 0, 0, 0, 0);
        for (let i = 0; i < N_size; i++) {
            const prob_to_end = P_full[i][216]; // 해당 상태에서 3아웃이 발생할 확률
            
            if (prob_to_end > 0) {
                const [curr_b] = REVERSE_STATE_MAP[i];
                const next_leadoff_batter = (curr_b + 1) % 9;
                const visits = N_data[start_node_for_b][i];
                
                // b번 타자로 시작한 이닝이 i번 상태에서 끝날 확률을 누적
                T[b][next_leadoff_batter] += visits * prob_to_end;
            }
        }
    }

    // --- [C] 9이닝 타순 연결성 시뮬레이션 ---
    let current_start_dist = new Array(9).fill(0);
    current_start_dist[0] = 1.0; // 1회초는 무조건 1번 타자 시작

    const leadoff_vector = new Array(9).fill(0);
    const pa_vector = new Array(9).fill(0);
    let total_9inning_re = 0;

    for (let inning = 1; inning <= 9; inning++) {
        const next_start_dist = new Array(9).fill(0);

        for (let b = 0; b < 9; b++) {
            const prob_b_starts = current_start_dist[b];
            if (prob_b_starts <= 0) continue;

            // 1. 선두타자 기대 횟수 누적 (합계는 정확히 9가 됨)
            leadoff_vector[b] += prob_b_starts;

            // 2. 해당 타자가 이닝을 시작했을 때의 이닝 기대 득점 합산
            const start_node = get_state_index(b, 0, 0, 0, 0);
            total_9inning_re += prob_b_starts * RE_data[start_node][0];

            // 3. 타자별 기대 타석 수(PA) 누적
            for (let j = 0; j < N_size; j++) {
                const [target_b_idx] = REVERSE_STATE_MAP[j];
                const visits = N_data[start_node][j];
                pa_vector[target_b_idx] += prob_b_starts * visits;
            }

            // 4. 다음 이닝 선두타자 분포 계산 (T 행렬 활용)
            if (inning < 9) {
                for (let next_b = 0; next_b < 9; next_b++) {
                    next_start_dist[next_b] += prob_b_starts * T[b][next_b];
                }
            }
        }
        
        if (inning < 9) {
            current_start_dist = [...next_start_dist];
        }
    }

    // 9이닝당 기대 득점 보너스 계산 (단순 합산 결과 포함)
    return {
        re: situational_re,           // 기존 결과 (x번 타자 y상황 RE)
        pa_vector: pa_vector,         // 9이닝당 기대 타석 수
        leadoff_vector: leadoff_vector, // 9이닝당 이닝 시작 횟수 (합계 = 9.0)
    };
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
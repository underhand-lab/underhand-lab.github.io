/**
 * 9인 라인업 반영 기대 득점 계산기 (기존 출력 형태 유지)
 */

// =====================
// 1. 상태 정의
// =====================
const STATE_MAP = {};
const REVERSE_STATE_MAP = {};
let count = 0;

// 9 타자 × 3 아웃 × 8 주자 상태 = 216
for (let b = 0; b < 9; b++) {
  for (let o = 0; o < 3; o++) {
    for (let b3 = 0; b3 < 2; b3++) {
      for (let b2 = 0; b2 < 2; b2++) {
        for (let b1 = 0; b1 < 2; b1++) {
          const key = [b, o, b3, b2, b1].join(",");
          STATE_MAP[key] = count;
          REVERSE_STATE_MAP[count] = [b, o, b3, b2, b1];
          count++;
        }
      }
    }
  }
}

const ABSORB = 216; // 단일 흡수 상태

function idx(b, o, b3, b2, b1) {
  if (o >= 3) return ABSORB;
  return STATE_MAP[[b % 9, o, b3, b2, b1].join(",")];
}

// =====================
// 2. 전이 행렬 생성
// =====================
function create_matrices(lineup, runner) {
  const P = Array(217).fill(0).map(() => Array(217).fill(0));
  const R = Array(216).fill(0).map(() => [0]);

  for (let i = 0; i < 216; i++) {
    const [b, o, b3, b2, b1] = REVERSE_STATE_MAP[i];
    const v = lineup[b];
    const nb = (b + 1) % 9;

    // -------- BB --------
    let nb1 = 1, nb2 = b2, nb3 = b3;
    if (b1) {
      if (b2) {
        if (b3) R[i][0] += v.bb;
        else nb3 = 1;
      } else nb2 = 1;
    }
    P[i][idx(nb, o, nb3, nb2, nb1)] += v.bb;

    // -------- SO --------
    P[i][idx(nb, o + 1, b3, b2, b1)] += v.so;

    // -------- FB --------
    if (b3 && o < 2) {
      P[i][idx(nb, o + 1, 1, b2, b1)] += v.fb * runner.sfx_stay;
      P[i][idx(nb, o + 1, 0, b2, b1)] += v.fb * runner.sf;
      R[i][0] += v.fb * runner.sf;
      P[i][idx(nb, o + 2, 0, b2, b1)] += v.fb * runner.sfx_out;
    } else {
      P[i][idx(nb, o + 1, b3, b2, b1)] += v.fb;
    }

    // -------- GB --------
    if (b1 && o < 2) {
      const p = v.gb;
      const p_dp = p * (1 - runner.dp1x - runner.dp2x);
      P[i][idx(nb, o + 1, b2, 1, 0)] += p * runner.dp1x;
      P[i][idx(nb, o + 1, b2, 0, 1)] += p * runner.dp2x;
      P[i][idx(nb, o + 2, b3, b2, 0)] += p_dp;
      if (b3) R[i][0] += p * (runner.dp1x + runner.dp2x);
    } else {
      P[i][idx(nb, o + 1, b2, b1, 0)] += v.gb;
      if (b3 && o < 2) R[i][0] += v.gb;
    }

    // -------- HR --------
    P[i][idx(nb, o, 0, 0, 0)] += v.hr;
    R[i][0] += v.hr * (1 + b1 + b2 + b3);

    // -------- 3B --------
    P[i][idx(nb, o, 1, 0, 0)] += v.th;
    R[i][0] += v.th * (b1 + b2 + b3);

    // -------- 2B --------
    P[i][idx(nb, o, b1, 1, 0)] += v.dh;
    R[i][0] += v.dh * (b2 + b3);

    // -------- 1B --------
    if (v.sh > 0) {
      R[i][0] += v.sh * (b3 + b2 * runner.twohome);

      if (b2) {
        P[i][idx(nb, o, 0, b1, 1)] += v.sh * runner.twohome;
        P[i][idx(nb, o + 1, 0, b1, 1)] += v.sh * runner.twohomeout;
        P[i][idx(nb, o, 1, b1, 1)] += v.sh * runner.twothree;
      } else if (b1) {
        P[i][idx(nb, o, 1, 0, 1)] += v.sh * runner.onethree;
        P[i][idx(nb, o, 0, 1, 1)] += v.sh * (1 - runner.onethree);
      } else {
        P[i][idx(nb, o, 0, 0, 1)] += v.sh;
      }
    }
  }

  // 흡수 상태
  P[ABSORB][ABSORB] = 1;
  return { P, R };
}

// =====================
// 3. 흡수 마르코프 해석
// =====================
function solve(P, R) {
  const N = 216;
  const Q = math.matrix(P.slice(0, N).map(r => r.slice(0, N)));
  const I = math.identity(N);

  const F = math.inv(math.subtract(I, Q));
  const Ndata = F.toArray();
  const RE = math.multiply(F, math.matrix(R)).toArray();

  // ===============================
  // ① 상황별 RE (기존 유지)
  // ===============================
  const situational_re = Array(9).fill(0).map(() => []);
  for (let i = 0; i < N; i++) {
    const [b] = REVERSE_STATE_MAP[i];
    situational_re[b].push(RE[i][0]);
  }

  // ===============================
  // ② 무사 주자없음 시작 RE
  // ===============================
  const leadoff_RE = Array(9).fill(0);
  for (let b = 0; b < 9; b++) {
    const s = idx(b, 0, 0, 0, 0);
    leadoff_RE[b] = RE[s][0];
  }

  // ===============================
  // ③ x번 → 다음 이닝 y번 전이행렬
  // ===============================
  const NextInningProb = Array(9).fill(0).map(() => Array(9).fill(0));

  for (let b = 0; b < 9; b++) {
    const s = idx(b, 0, 0, 0, 0);

    for (let i = 0; i < N; i++) {
      const visits = Ndata[s][i];
      if (!visits) continue;

      const pend = P[i][ABSORB];
      if (!pend) continue;

      const [tb] = REVERSE_STATE_MAP[i];
      const nextb = (tb + 1) % 9;

      NextInningProb[b][nextb] += visits * pend;
    }
  }

  // ===============================
  // ④ 상위 마르코프: 이닝 시작 타자 분포
  // ===============================
  let start_dist = Array(9).fill(0);
  start_dist[0] = 1;

  const leadoff_vector = Array(9).fill(0);

  for (let inning = 0; inning < 9; inning++) {
    const next_dist = Array(9).fill(0);

    for (let b = 0; b < 9; b++) {
      const p = start_dist[b];
      if (!p) continue;

      leadoff_vector[b] += p;

      for (let nb = 0; nb < 9; nb++) {
        next_dist[nb] += p * NextInningProb[b][nb];
      }
    }

    start_dist = next_dist;
  }

  return {
    re: situational_re,
    leadoff_vector: leadoff_vector
  };
}

// =====================
// 4. 외부 API
// =====================
export function calculate_lineup_re(lineup, runner) {
  const { P, R } = create_matrices(lineup, runner);
  return solve(P, R);
}

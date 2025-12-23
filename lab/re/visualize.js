export function visualizeRE(RE) {
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

export function visualizeRunValue(dataList) {
    if (!dataList) {
        return "";
    }
    
    dataList.sort((a, b) => b.value - a.value);

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

    // 3. 정렬된 데이터로 HTML 생성
    for (const item of dataList) {
        html += `
            <tr>
                <td class="runner-state">${item.label}</td>
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
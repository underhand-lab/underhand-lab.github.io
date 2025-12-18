export function downloadCSV(json, filename) {
    let csvContent = "data:text/csv;charset=utf-8,";

    // 1. 헤더 추가 (JSON 키 활용)
    const headers = Object.keys(json[0]);
    csvContent += headers.join(',') + '\r\n';

    // 2. 데이터 추가
    json.forEach(row => {
        const values = headers.map(header => row[header]);
        csvContent += values.join(',') + '\r\n';
    });

    // 3. 다운로드 링크 생성 및 클릭
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function readCSV(csv) {

    var lines = csv.split("\n");

    var result = [];

    var headers = lines[0].split(",");

    for (var i = 1; i < lines.length; i++) {

        if (lines[i].length < 1) continue;

        var obj = {};
        var currentline = lines[i].split(",");

        for (var j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
        }

        result.push(obj);

    }

    return result; //JavaScript object
}
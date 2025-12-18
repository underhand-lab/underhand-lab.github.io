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
    // \r\n (Windows), \n (Unix), \r (Old Mac) 모두를 대응하는 정규표현식입니다.
    var lines = csv.split(/\r?\n|\r/);

    var result = [];
    var headers = lines[0].split(",");

    for (var i = 1; i < lines.length; i++) {
        // 공백만 있는 줄이나 빈 줄은 건너뜁니다.
        if (!lines[i].trim()) continue;

        var obj = {};
        var currentline = lines[i].split(",");

        for (var j = 0; j < headers.length; j++) {
            var value = currentline[j] ? currentline[j].trim() : "";
            obj[headers[j].trim()] = value;
        }

        result.push(obj);
    }

    return result;
}
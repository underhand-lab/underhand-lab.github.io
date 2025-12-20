export async function downloadCSV(json, filename) {

    const headers = Object.keys(json[0]);
    const csvRows = json.map(row => 
        headers.map(header => {
            const value = row[header];
            const safeValue = (value === null || value === undefined) ? "" : value;
            
            // 데이터 내부에 쉼표(,)나 줄바꿈이 있을 경우를 대비해 큰따옴표로 감싸기
            return `"${String(safeValue).replace(/"/g, '""')}"`;
        }).join(',')
    );
    const csvContent = [headers.join(','), ...csvRows].join('\n');

    try {
        // 2. 파일 저장 대화상자 열기
        const handle = await window.showSaveFilePicker({
            suggestedName: filename,
            types: [{
                description: 'CSV File',
                accept: { 'text/csv': ['.csv'] },
            }],
        });

        // 3. 파일에 쓰기
        const writable = await handle.createWritable();
        await writable.write(csvContent);
        await writable.close();

        console.log("파일이 성공적으로 저장되었습니다.");
    } catch (err) {
        console.error("저장이 취소되었거나 에러가 발생했습니다.", err);
    }
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
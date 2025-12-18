import * as Box from "/src/box/box.js";

const boxList = new Box.BoxList(document.getElementById("boxes"));
let players = [];

function addBox(opt, batter, func, toBottom = true) {
    fetch(opt).then(response => {
        if (!response.ok) {
            throw new Error(`파일을 불러오는 데 실패했습니다: ${response.statusText}`);
        }
        return response.text();

    }).then((text) => {
        const box = boxList.addBox(text, () => {

        });
        box.className = 'container';
        func(box);
        players.push(batter);
    }).catch(error => {
        console.error(`분석 도구 생성 중 오류가 발생했습니다.: ${error}`);
    });
}

addBox("./template/batter.html",);
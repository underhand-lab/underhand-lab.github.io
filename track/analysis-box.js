import * as FrameMaker from '/src/track/frame-maker/index.js';
import * as Box from "/src/box/box.js"
import * as Analysis from "/src/track/calc/analysis.js"
import { PopUp } from "/src/pop-up.js"

let frameMakers = [];
let processedData = null;

const confInput = document.getElementById('confInput');
confInput.addEventListener('change', () => {
    updateImage();
});

const slider = document.getElementById('frameSlider');
slider.max = 0;

function nowIdx() {
    return parseInt(slider.value, 10);
}

// 슬라이더를 움직일 때마다 이미지를 업데이트하는 함수
function updateImage() {

    if (!processedData) return;

    const frameIdx = nowIdx();

    for (let i = 0; i < frameMakers.length; i++) {
        frameMakers[i].setConf(confInput.value);
        frameMakers[i].drawImageAt(frameIdx);
    }

}

slider.addEventListener('input', updateImage);

function setData(data) {

    if (data == null) return;

    const frameCount = data["rawImage"].length;
    slider.max = frameCount > 0 ? frameCount - 1 : 0;

    processedData = data;

    for (let i = 0; i < frameMakers.length; i++) {
        frameMakers[i].setData(data);
    }

    updateImage();

}

const analysisSelect = new PopUp(
    document.getElementById('analysis'),
    document.getElementById('add-box-button'),
    document.getElementById('cancel-add-box-button'));

const addVideoBoxBtn = document.getElementById('add-video-box-button');
const addTableBoxBtn = document.getElementById('add-table-box-button');

const boxList = new Box.BoxList(document.getElementById("boxes"));

function addBox(opt, frameMaker, func, toBottom = true) {
    fetch(opt)
        .then(response => {
            if (!response.ok) {
                throw new Error(`파일을 불러오는 데 실패했습니다: ${response.statusText}`);
            }
            return response.text();
        })
        .then((text) => {
            const box = boxList.addBox(text, () => {
                frameMakers = frameMakers.filter(fm => fm !== frameMaker);
            });

            box.className = 'container neumorphism';
            func(box);
            if (toBottom) {
                let bottom = document.body.scrollHeight;
                window.scrollTo({ top: bottom, left: 0, behavior: 'smooth' })
            }

            frameMaker.setData(processedData);

            frameMakers.push(frameMaker);
            frameMaker.drawImageAt(nowIdx());
            analysisSelect.close();

        })
        .catch(error => {
            console.error(`분석 도구 생성 중 오류가 발생했습니다.: ${error}`);
        });

}

addVideoBoxBtn.addEventListener('click', () => {
    const newPoseFrameMaker = new FrameMaker.TrackFrameMaker();
    addBox("/template/video.html", newPoseFrameMaker, (box) => {

        const newCanvas = box.querySelectorAll("canvas")[0];
        newPoseFrameMaker.setInstance(newCanvas);

    });

});

addTableBoxBtn.addEventListener('click', () => {
    const newTableFrameMaker = new FrameMaker.CustomTableFrameMaker();

    addBox("/template/table-track.html", newTableFrameMaker, (box) => {

        const newDiv = box.getElementsByClassName("table")[0];
        newTableFrameMaker.setInstance(newDiv);

        newTableFrameMaker.changeAnalysisTool(new Analysis.BallAnalysisTool());
    });

});

const newPoseFrameMaker = new FrameMaker.TrackFrameMaker();

addBox("/template/video.html", newPoseFrameMaker, (box) => {

    const newCanvas = box.querySelectorAll("canvas")[0];
    newPoseFrameMaker.setInstance(newCanvas);
    
}, false);

const newTableFrameMaker = new FrameMaker.CustomTableFrameMaker();

addBox("/template/table-track.html", newTableFrameMaker, (box) => {

    const newDiv = box.getElementsByClassName("table")[0];
    newTableFrameMaker.setInstance(newDiv);
    newTableFrameMaker.changeAnalysisTool(new Analysis.BallAnalysisTool());

}, false);

export { setData }
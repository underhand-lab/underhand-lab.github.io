import * as PoseAnalysis from "/src/pose/analysis-tool/index.js";
import * as PoseFrameMaker from '/src/pose/frame-maker/index.js';
import * as Box from "/src/box/box.js"
import { PopUp } from "/src/pop-up.js"

const currentFrameIdxSpan = document.getElementById('currentFrameIdx');
const totalFramesSpan = document.getElementById('totalFrames');

let frameMakers = [];
let processedData = null;

const slider = document.getElementById('frameSlider');
slider.max = 0;

function nowIdx() {
    return parseInt(slider.value, 10);
}

function updateImage() {

    if (!processedData) return;

    const frameIdx = nowIdx();
    
    for (let i = 0; i < frameMakers.length; i++) {
        frameMakers[i].drawImageAt(frameIdx);
    }

}

slider.addEventListener('input', updateImage);

function setData(data) {

    if (data == null) return;

    processedData = data;

    for (let i = 0; i < frameMakers.length; i++) {
        frameMakers[i].setData(processedData);
    }

    const frameCount = processedData.getFrameCnt();
    slider.max = frameCount > 0 ? frameCount - 1 : 0;

    updateImage();

}


const analysisSelect = new PopUp(
    document.getElementById('analysis'),
    document.getElementById('add-box-button'),
    document.getElementById('cancel-add-box-button'));

const addVideoBoxBtn = document.getElementById('add-video-box-button');
const add3dVideoBoxBtn = document.getElementById('add-3d-video-box-button');
const addGraphBoxBtn = document.getElementById('add-graph-box-button');
const addTableBoxBtn = document.getElementById('add-table-box-button');

const boxList = new Box.BoxList(document.getElementById("boxes"));

const analysisTool = {
    "joint": new PoseAnalysis.AngleAnalysisTool(),
    "velocity": new PoseAnalysis.VelocityAnalysisTool(),
    "height": new PoseAnalysis.HeightAnalysisTool(),
}

function addBox(opt, func, toBottom = true) {
    fetch(opt)
        .then(response => {
            if (!response.ok) {
                throw new Error(`파일을 불러오는 데 실패했습니다: ${response.statusText}`);
            }
            return response.text();
        })
        .then((text) => {
            const box = boxList.addBox(text);
            box.className = 'container neumorphism';
            func(box);
            if (toBottom) {
                let bottom = document.body.scrollHeight;
                window.scrollTo({ top: bottom, left: 0, behavior: 'smooth' })
            }
            analysisSelect.close();
        })
        .catch(error => {
            console.error(`분석 도구 생성 중 오류가 발생했습니다.: ${error}`);
        });

}

addVideoBoxBtn.addEventListener('click', () => {
    addBox("/template/video.html", (box) => {

        const newCanvas = box.querySelectorAll("canvas")[0];
        const newPoseFrameMaker = new PoseFrameMaker.PoseBoneFrameMaker(newCanvas);

        newPoseFrameMaker.setData(processedData);

        frameMakers.push(newPoseFrameMaker);
        newPoseFrameMaker.drawImageAt(nowIdx());
    });

});

add3dVideoBoxBtn.addEventListener('click', () => {
    addBox("/template/3d-video.html", (box) => {

        const newCanvas = box.querySelectorAll("canvas")[0];
        const newPoseFrameMaker = new PoseFrameMaker.Pose3DFrameMaker(newCanvas)

        newPoseFrameMaker.setData(processedData);

        frameMakers.push(newPoseFrameMaker);
        newPoseFrameMaker.drawImageAt(nowIdx());
    });

});

addGraphBoxBtn.addEventListener('click', () => {
    addBox("/template/graph.html", (box) => {

        const newCanvas = box.querySelectorAll("canvas")[0];
        const newGraphFrameMaker = new PoseFrameMaker.CustomGraphFrameMaker(newCanvas);
        const options = box.querySelectorAll("select")[0];

        newGraphFrameMaker.changeAnalysisTool(analysisTool[options.value]);
        newGraphFrameMaker.setData(processedData);

        options.addEventListener("change", () => {
            newGraphFrameMaker.changeAnalysisTool(analysisTool[options.value]);
            newGraphFrameMaker.drawImageAt(nowIdx());
        });

        frameMakers.push(newGraphFrameMaker);
        newGraphFrameMaker.drawImageAt(nowIdx());
    });

});

addTableBoxBtn.addEventListener('click', () => {
    addBox("/template/table-pose.html", (box) => {

        const newDiv = box.getElementsByClassName("table")[0];
        const newTableFrameMaker = new PoseFrameMaker.CustomTableFrameMaker(newDiv);
        const options = box.querySelectorAll("select")[0];

        newTableFrameMaker.changeAnalysisTool(analysisTool[options.value]);
        newTableFrameMaker.setData(processedData);

        options.addEventListener("change", () => {
            newTableFrameMaker.changeAnalysisTool(analysisTool[options.value]);
            newTableFrameMaker.drawImageAt(nowIdx());
        });

        frameMakers.push(newTableFrameMaker);
        newTableFrameMaker.drawImageAt(nowIdx());
    });

});

addBox("/template/video.html", (box) => {

    const newCanvas = box.querySelectorAll("canvas")[0];
    const newPoseFrameMaker = new PoseFrameMaker.PoseBoneFrameMaker(newCanvas);

    newPoseFrameMaker.setData(processedData);

    frameMakers.push(newPoseFrameMaker);
    newPoseFrameMaker.drawImageAt(nowIdx());

}, false);

export { setData }
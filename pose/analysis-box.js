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
    "angle": new PoseAnalysis.AngleAnalysisTool(),
    "angle-velocity": new PoseAnalysis.AngleVelocityAnalysisTool(),
    "velocity": new PoseAnalysis.VelocityAnalysisTool(),
    "height": new PoseAnalysis.HeightAnalysisTool(),
}

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
                console.log(frameMakers);
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
    const newPoseFrameMaker = new PoseFrameMaker.PoseBoneFrameMaker();
    addBox("/template/video.html", newPoseFrameMaker, (box) => {

        const newCanvas = box.querySelectorAll("canvas")[0];
        newPoseFrameMaker.setInstance(newCanvas);

    });

});

add3dVideoBoxBtn.addEventListener('click', () => {
    const newPoseFrameMaker = new PoseFrameMaker.Pose3DFrameMaker();

    addBox("/template/3d-video.html", newPoseFrameMaker, (box) => {

        const newCanvas = box.querySelectorAll("canvas")[0];
        newPoseFrameMaker.setInstance(newCanvas);

    });

});

addGraphBoxBtn.addEventListener('click', () => {
    const newGraphFrameMaker = new PoseFrameMaker.CustomGraphFrameMaker();

    addBox("/template/graph.html", newGraphFrameMaker, (box) => {

        const newCanvas = box.querySelectorAll("canvas")[0];
        newGraphFrameMaker.setInstance(newCanvas);

        const options = box.querySelectorAll("select")[0];

        options.addEventListener("change", () => {
            newGraphFrameMaker.changeAnalysisTool(analysisTool[options.value]);
            newGraphFrameMaker.drawImageAt(nowIdx());
        });

        newGraphFrameMaker.changeAnalysisTool(analysisTool[options.value]);
    });

});

addTableBoxBtn.addEventListener('click', () => {
    const newTableFrameMaker = new PoseFrameMaker.CustomTableFrameMaker();

    addBox("/template/table-pose.html", newTableFrameMaker, (box) => {

        const newDiv = box.getElementsByClassName("table")[0];
        newTableFrameMaker.setInstance(newDiv);

        const options = box.querySelectorAll("select")[0];

        options.addEventListener("change", () => {
            newTableFrameMaker.changeAnalysisTool(analysisTool[options.value]);
            newTableFrameMaker.drawImageAt(nowIdx());
        });

        newTableFrameMaker.changeAnalysisTool(analysisTool[options.value]);

    });

});

const newPoseFrameMaker = new PoseFrameMaker.PoseBoneFrameMaker();
addBox("/template/video.html", newPoseFrameMaker, (box) => {

    const newCanvas = box.querySelectorAll("canvas")[0];
    newPoseFrameMaker.setInstance(newCanvas);

}, false);

const newGraphFrameMaker = new PoseFrameMaker.CustomGraphFrameMaker();
addBox("/template/graph.html", newGraphFrameMaker, (box) => {

    const newCanvas = box.querySelectorAll("canvas")[0];
    newGraphFrameMaker.setInstance(newCanvas);
    const options = box.querySelectorAll("select")[0];

    options.addEventListener("change", () => {
        newGraphFrameMaker.changeAnalysisTool(analysisTool[options.value]);
        newGraphFrameMaker.drawImageAt(nowIdx());
    });

    newGraphFrameMaker.changeAnalysisTool(analysisTool[options.value]);

}, false);

export { setData }
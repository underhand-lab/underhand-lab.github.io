import * as PoseDetector from '/src/pose/pose-detector/index.js';
import * as PoseAnalysis from "/src/pose/analysis-tool/index.js";
import * as PoseFrameMaker from '/src/pose/frame-maker/index.js';
import { PoseProcessor } from '/src/pose/processor.js';
import * as Box from "/src/box/box.js"



const fileInput = document.getElementById('video-files');
fileInput.addEventListener('change', () => {
    processButton.disabled = fileInput.files.length < 1;
});

const slider = document.getElementById('frameSlider');
slider.addEventListener('input', updateImage);

slider.max = 0;

// 로드된 비디오 데이터를 저장할 변수
let processedData = null;

let frameMakers = [];

// 슬라이더를 움직일 때마다 이미지를 업데이트하는 함수
function updateImage() {

    if (!processedData) return;

    const frameIdx = parseInt(slider.value, 10);
    //currentFrameIdxSpan.textContent = frameIdx;
    
    for (let i = 0; i < frameMakers.length; i++) {
        frameMakers[i].drawImageAt(frameIdx);
    }

}

function setData(data) {

    if (data == null) return;

    processedData = data;

    //graphFrameMaker.set_data(analysisTool[analysisSelect.value].calc(processedData));
    //poseFrameMaker.set_data(processedData);

    for (let i = 0; i < frameMakers.length; i++) {
        frameMakers[i].setData(processedData);
    }

    const frameCount = processedData.getFrameCnt();
    slider.max = frameCount > 0 ? frameCount - 1 : 0;

    updateImage();

}

const currentFrameIdxSpan = document.getElementById('currentFrameIdx');
const totalFramesSpan = document.getElementById('totalFrames');

const processButton = document.getElementById('process-button');
const statusMessage = document.getElementById('status-message');
const progressBar = document.getElementById('progress-bar');

// 초기화 및 비디오 처리
processButton.addEventListener('click', async () => {

    // 버튼을 비활성화하여 중복 클릭 방지
    processButton.disabled = true;

    // 프로세서 및 탐지기 초기화
    const processor = new PoseProcessor();
    const detector = new PoseDetector.MediaPipePoseDetector();

    // 프로세서 설정 및 비디오 처리
    try {
        processor.setting(detector, {
            onState: (state) => {
                statusMessage.textContent = state;
            },
            onProgress: (current, total) => {
                const percentage = (current / total) * 100;
                progressBar.style.width = `${percentage}%`;
            }
        });

        // data 변수에 모든 처리된 데이터를 저장
        const ret = await processor.processVideo(fileInput.files);

        setData(ret);
        console.log('비디오 처리가 완료되었습니다.');

    } catch (error) {

        alert("비디오 처리 중 오류 발생")
        console.error("비디오 처리 중 오류 발생:", error);

    } finally {
        // 처리가 완료되면 버튼을 다시 활성화
        processButton.disabled = false;
    }

});

const guide = document.getElementById('guide');
const openGuideButton = document.getElementById('open-guide-button');
const closeGuideButton = document.getElementById('close-guide-button');

openGuideButton.addEventListener('click', () => {
    guide.style.display = "block";
});

closeGuideButton.addEventListener('click', () => {
    guide.style.display = "none";
});

const analysisSelect = document.getElementById('analysis');

//const poseFrameMaker = new PoseFrameMaker.Pose3DFrameMaker(canvasImage);
const boxList = new Box.BoxList(document.getElementById("boxes"));

const addBoxButton = document.getElementById('add-box-button');
const cancelAddBoxBtn = document.getElementById('cancel-add-box-button');
const addVideoBoxBtn = document.getElementById('add-video-box-button');
const add3dVideoBoxBtn = document.getElementById('add-3d-video-box-button');
const addGraphBoxBtn = document.getElementById('add-graph-box-button');
const addTableBoxBtn = document.getElementById('add-table-box-button');

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
            closeBoxSelect();
        })
        .catch(error => {
            console.error(`분석 도구 생성 중 오류가 발생했습니다.: ${error}`);
        });

}

addBoxButton.addEventListener('click', () => {
    analysisSelect.style.display = "block";
});

cancelAddBoxBtn.addEventListener('click', () => {
    closeBoxSelect();
});

addVideoBoxBtn.addEventListener('click', () => {
    addBox("/template/video.html", (box) => {

        const newCanvas = box.querySelectorAll("canvas")[0];
        const newPoseFrameMaker = new PoseFrameMaker.PoseBoneFrameMaker(newCanvas);

        newPoseFrameMaker.setData(processedData);

        frameMakers.push(newPoseFrameMaker);
        updateImage();
    });

});

add3dVideoBoxBtn.addEventListener('click', () => {
    addBox("/template/3d-video.html", (box) => {

        const newCanvas = box.querySelectorAll("canvas")[0];
        const newPoseFrameMaker = new PoseFrameMaker.Pose3DFrameMaker(newCanvas)

        newPoseFrameMaker.setData(processedData);

        frameMakers.push(newPoseFrameMaker);
        updateImage();
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
            updateImage();
        });

        frameMakers.push(newGraphFrameMaker);
        updateImage();
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
            updateImage();
        });

        frameMakers.push(newTableFrameMaker);
        updateImage();
    });

});

function closeBoxSelect() {
    analysisSelect.style.display = "none";
}

addBox("/template/video.html", (box) => {

    const newCanvas = box.querySelectorAll("canvas")[0];
    const newPoseFrameMaker = new PoseFrameMaker.PoseBoneFrameMaker(newCanvas);

    newPoseFrameMaker.setData(processedData);

    frameMakers.push(newPoseFrameMaker);
    updateImage();

}, false);
import { TrackProcessor } from '/src/track/processor.js';
import * as BallDetector from '/src/track/ball-detector/index.js';
import * as FrameMaker from '/src/track/frame-maker/index.js';
import * as Box from "/src/box/box.js"
import * as Analysis from "/src/track/calc/analysis.js"

// DOM 요소 가져오기
const canvasImage = document.getElementById('outputImage');
const dataText = document.getElementById('dataText');
const slider = document.getElementById('frameSlider');

const fileInput = document.getElementById('video-files');
const processButton = document.getElementById('process-button');
const statusMessage = document.getElementById('status-message');
const progressBar = document.getElementById('progress-bar');
const confInput = document.getElementById('confInput');

let frameMakers = [];

slider.max = 0;

// 로드된 비디오 데이터를 저장할 변수
let processedData = null;
const detector = new BallDetector.YOLO11BallDetector();

frameMakers.push(new FrameMaker.TrackFrameMaker(canvasImage));

// 슬라이더를 움직일 때마다 이미지를 업데이트하는 함수
function updateImage() {

    if (!processedData) return;

    const frameIdx = parseInt(slider.value, 10);

    for (let i = 0; i < frameMakers.length; i++) {
        frameMakers[i].setConf(confInput.value);
        frameMakers[i].drawImageAt(frameIdx);
    }

}

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

confInput.addEventListener('change', () => {
    updateImage();
});

// 초기화 및 비디오 처리
processButton.addEventListener('click', async () => {

    // 버튼을 비활성화하여 중복 클릭 방지
    processButton.disabled = true;

    // 프로세서 및 탐지기 초기화
    const processor = new TrackProcessor();

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

fileInput.addEventListener('change', () => {
    processButton.disabled = fileInput.files.length < 1;
});

slider.addEventListener('input', updateImage);

const analysisSelect = document.getElementById('analysis');
const addBoxButton = document.getElementById('add-box-button');
const cancelAddBoxBtn = document.getElementById('cancel-add-box-button');
const addVideoBoxBtn = document.getElementById('add-video-box-button');
const addTableBoxBtn = document.getElementById('add-table-box-button');

const boxList = new Box.BoxList(document.getElementById("boxes"));

function addBox(opt, func) {
    fetch(opt)
        .then(response => {
            if (!response.ok) {
                throw new Error(`파일을 불러오는 데 실패했습니다: ${response.statusText}`);
            }
            return response.text();
        })
        .then((text) => {
            const box = boxList.addBox(text);
            func(box);
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
        const newPoseFrameMaker = new FrameMaker.TrackFrameMaker(newCanvas)

        newPoseFrameMaker.setData(processedData);

        frameMakers.push(newPoseFrameMaker);
        updateImage();
    });

});

addTableBoxBtn.addEventListener('click', () => {
    addBox("/template/table-track.html", (box) => {

        const newDiv = box.getElementsByClassName("table")[0];
        const newTableFrameMaker = new FrameMaker.CustomTableFrameMaker(newDiv);


        newTableFrameMaker.changeAnalysisTool(new Analysis.BallAnalysisTool());

        newTableFrameMaker.setData(processedData);

        frameMakers.push(newTableFrameMaker);
        updateImage();
    });

});

function closeBoxSelect() {
    analysisSelect.style.display = "none";
}

addBox("/template/video.html", (box) => {

    const newCanvas = box.querySelectorAll("canvas")[0];
    const newPoseFrameMaker = new FrameMaker.TrackFrameMaker(newCanvas)

    newPoseFrameMaker.setData(processedData);

    frameMakers.push(newPoseFrameMaker);
    updateImage();
});

addBox("/template/table-track.html", (box) => {

    const newDiv = box.getElementsByClassName("table")[0];
    const newTableFrameMaker = new FrameMaker.CustomTableFrameMaker(newDiv);

    newTableFrameMaker.changeAnalysisTool(new Analysis.BallAnalysisTool());

    newTableFrameMaker.setData(processedData);

    frameMakers.push(newTableFrameMaker);
    updateImage();

});
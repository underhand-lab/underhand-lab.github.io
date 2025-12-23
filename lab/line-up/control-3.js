import * as control from "./control.js";

let batterListToggle = true;

const batterListToggleBtn = 
document.getElementById("toggle-batter-list-pop-up");

batterListToggleBtn.addEventListener('click', () => {
    const target = document.getElementById('batter-list-toggle');
    if (batterListToggle) {
        batterListToggle = false;
        target.dataset.toggle="min";
        batterListToggleBtn.innerHTML = '+';
        return;
    }
    batterListToggle = true;
    target.dataset.toggle="max";
    batterListToggleBtn.innerHTML = '-';
})

let lineupToggle = true;
const lineupToggleBtn = 
document.getElementById("toggle-line-up");

lineupToggleBtn.addEventListener('click', () => {
    const target = document.getElementById('line-up-toggle');
    if (lineupToggle) {
        lineupToggle = false;
        target.dataset.toggle="min";
        lineupToggleBtn.innerHTML = '+';
        return;
    }
    lineupToggle = true;
    target.dataset.toggle="max";
    lineupToggleBtn.innerHTML = '-';
})

let runnerToggle = true;
const runnerToggleBtn = 
document.getElementById("toggle-runner");

runnerToggleBtn.addEventListener('click', () => {
    const target = document.getElementById('runner-toggle');
    if (runnerToggle) {
        runnerToggle = false;
        target.dataset.toggle="min";
        runnerToggleBtn.innerHTML = '+';
        return;
    }
    runnerToggle = true;
    target.dataset.toggle="max";
    runnerToggleBtn.innerHTML = '-';
});

let batterToggle = true;
const batterToggleBtn = 
document.getElementById("toggle-batter");

batterToggleBtn.addEventListener('click', () => {
    const target = document.getElementById('batter-toggle');
    if (batterToggle) {
        batterToggle = false;
        target.dataset.toggle="min";
        batterToggleBtn.innerHTML = '+';
        return;
    }
    batterToggle = true;
    target.dataset.toggle="max";
    batterToggleBtn.innerHTML = '-';
});
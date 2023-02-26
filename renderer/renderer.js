const timeRemainingElement = document.getElementById('timeRemaining');
const progressBarFillElement = document.getElementById('progressBarFill');
const processStatusElement = document.getElementById('processStatus');


window.api.on('progress', (event, progress)=>{
  timeRemainingElement.innerText = `Time remaining: ${progress.remainingMinutes} minutes, ${progress.remainingSeconds} seconds`;
  progressBarFillElement.style.width = `${progress.progress}%`;
});

window.api.on('changeProcessStatus', (event, status)=>{
  processStatusElement.innerText = status;
});
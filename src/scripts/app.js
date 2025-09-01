const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
const canvas = document.getElementById('canvas');
const canvasContext = canvas.getContext('2d');
const microphone = null;

navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 2048;
        draw();
    })
    .catch(err => {
        console.error('Error accessing microphone: ', err);
    });

function draw() {
    requestAnimationFrame(draw);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    
    canvasContext.fillStyle = 'rgba(0, 0, 0, 0.1)';
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    
    const barWidth = (canvas.width / analyser.frequencyBinCount) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < analyser.frequencyBinCount; i++) {
        barHeight = dataArray[i];
        canvasContext.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
        canvasContext.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
    }
}
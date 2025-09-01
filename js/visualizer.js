// 音声データを解析し、Canvas上にグラフを描画するためのロジック

const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

function drawVisualizer(frequencyData) {
    const barWidth = (canvas.width / frequencyData.length) * 2.5;
    let barHeight;
    let x = 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < frequencyData.length; i++) {
        barHeight = frequencyData[i] / 2;

        const r = barHeight + (25 * (i / frequencyData.length));
        const g = 250 * (i / frequencyData.length);
        const b = 50;

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
    }

    drawCurrentTimeLine();
}

function drawCurrentTimeLine() {
    const currentTime = new Date();
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(currentTime.getSeconds() * (canvas.width / 60), 0);
    ctx.lineTo(currentTime.getSeconds() * (canvas.width / 60), canvas.height);
    ctx.stroke();
}

export { drawVisualizer };
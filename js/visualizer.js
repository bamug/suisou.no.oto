// 音声データを解析し、Canvas上にスペクトログラムを描画するためのロジック

const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
let audioContext; // main.jsから設定される
let sampleRate;   // main.jsから設定される

// 初期化関数
function initVisualizer(context) {
    audioContext = context;
    sampleRate = context.sampleRate;
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

// キャンバスのサイズを親要素に合わせる
function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    drawFrequencyAxis(); // リサイズ時に軸を再描画
}

// 音量を色に変換 (0-255 -> 緑-黄-赤)
function getColor(value) {
    const normalizedValue = value / 255;
    // hue: 120 (緑) -> 60 (黄) -> 0 (赤)
    const hue = (1 - normalizedValue) * 120;
    return `hsl(${hue}, 100%, 50%)`;
}

// スペクトログラムを描画
function drawVisualizer(frequencyData) {
    // 1. 現在のキャンバスの描画内容を1ピクセル左にずらす
    const imageData = ctx.getImageData(1, 0, canvas.width - 1, canvas.height);
    ctx.putImageData(imageData, 0, 0);

    // 2. 右端に新しい周波数データを描画
    const binCount = frequencyData.length;
    for (let i = 0; i < binCount; i++) {
        const value = frequencyData[i];
        const color = getColor(value);

        // 周波数軸を対数的にマッピングするとより音楽的に見やすいですが、まずは線形で実装
        // y座標を反転させる (上が高周波)
        const y = canvas.height - (i / binCount) * canvas.height;
        
        ctx.fillStyle = color;
        ctx.fillRect(canvas.width - 1, y, 1, 1); // 1ピクセルの幅で描画
    }

    drawFrequencyAxis();
}

// 周波数軸の補助線とラベルを描画
function drawFrequencyAxis() {
    // 軸描画のために右端の100pxをクリア
    ctx.clearRect(canvas.width - 100, 0, 100, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';

    const maxFreq = sampleRate / 2;
    const frequencies = [1000, 2000, 5000, 10000, 20000]; // 表示したい周波数

    frequencies.forEach(freq => {
        if (freq <= maxFreq) {
            const y = canvas.height - (freq / maxFreq) * canvas.height;
            
            // 補助線
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 0.5;
            ctx.stroke();

            // ラベル
            ctx.fillText(`${Math.round(freq / 1000)}k`, canvas.width - 40, y + 4);
        }
    });

    // 現在時刻を示す線
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width - 1, 0);
    ctx.lineTo(canvas.width - 1, canvas.height);
    ctx.stroke();
}

export { initVisualizer, drawVisualizer };
// 音声データを解析し、Canvas上にスペクトログラムを描画するためのロジック

const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
let audioContext; // main.jsから設定される
let sampleRate;   // main.jsから設定される

// 初期化関数
export function initVisualizer(context) {
    audioContext = context;
    sampleRate = context.sampleRate;
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

// キャンバスのサイズを親要素に合わせる
function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    // リサイズ時に背景と軸を再描画
    drawBackgroundAndAxis();
}

// 音量を色に変換 (0-255 -> 緑-黄-赤)
function getColor(value) {
    const normalizedValue = value / 255;
    // hue: 120 (緑) -> 60 (黄) -> 0 (赤)
    const hue = (1 - normalizedValue) * 120;
    return `hsl(${hue}, 100%, 50%)`;
}

// スペクトログラムを描画
export function drawVisualizer(frequencyData) {
    // 1. 現在のキャンバスの描画内容を1ピクセル左にずらす
    // 軸表示エリア(右側50px)はスクロールさせない
    const imageData = ctx.getImageData(1, 0, canvas.width - 51, canvas.height);
    ctx.putImageData(imageData, 0, 0);

    // 2. 右端（軸の左隣）に新しい周波数データを描画
    const binCount = frequencyData.length;
    const barWidth = 1;
    const newColumnX = canvas.width - 51;

    for (let i = 0; i < binCount; i++) {
        const value = frequencyData[i];
        const color = getColor(value);

        // 周波数帯域をキャンバスの高さにマッピング
        // y座標を反転させる (上が高周波)
        const y = canvas.height - (i / binCount) * canvas.height;
        const barHeight = canvas.height / binCount;
        
        ctx.fillStyle = color;
        ctx.fillRect(newColumnX, y - barHeight, barWidth, barHeight);
    }
    
    // 現在時刻を示す線を再描画
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(newColumnX, 0);
    ctx.lineTo(newColumnX, canvas.height);
    ctx.stroke();
}

// 背景と周波数軸を描画
function drawBackgroundAndAxis() {
    // 背景を黒で塗りつぶし
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 軸表示エリアの背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(canvas.width - 50, 0, 50, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';

    const maxFreq = sampleRate / 2;
    // 表示したい周波数 (kHz)
    const frequencies = [1, 2, 5, 10, 20]; 

    frequencies.forEach(freqKHz => {
        const freq = freqKHz * 1000;
        if (freq <= maxFreq) {
            const y = canvas.height - (freq / maxFreq) * canvas.height;
            
            // 補助線
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width - 50, y); // 軸エリアの手前まで
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // ラベル
            ctx.fillText(`${freqKHz}k`, canvas.width - 40, y + 4);
        }
    });
}

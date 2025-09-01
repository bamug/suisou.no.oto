// 音声データを解析し、Canvas上にスペクトログラムを描画するためのロジック

const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
let audioContext; // main.jsから設定される
let sampleRate;   // main.jsから設定される
let lastDrawTime = Date.now();
const SCROLL_SPEED = 1; // スクロール速度（ピクセル/フレーム）

// 初期化関数
export function initVisualizer(context) {
    audioContext = context;
    sampleRate = context.sampleRate;
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    // 初期背景を黒で塗りつぶし
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// キャンバスのサイズを親要素に合わせる
function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}

// 音量を色に変換 (0-255 -> 緑-黄-赤)
function getColor(value) {
    // 音量に基づいて色を生成（0-255の値を使用）
    const normalizedValue = Math.min(value / 255, 1.0);
    if (normalizedValue < 0.3) {
        // 小さい音量は緑
        return `rgb(0, ${Math.floor(255 * normalizedValue * 2)}, 0)`;
    } else if (normalizedValue < 0.6) {
        // 中間の音量は黄色に遷移
        return `rgb(${Math.floor(255 * normalizedValue * 2)}, 255, 0)`;
    } else {
        // 大きい音量は赤
        return `rgb(255, ${Math.floor(255 * (1 - normalizedValue))}, 0)`;
    }
}

// スペクトログラムを描画
export function drawVisualizer(frequencyData) {
    // 現在のキャンバスの内容を左にスクロール
    const imageData = ctx.getImageData(SCROLL_SPEED, 0, canvas.width - SCROLL_SPEED, canvas.height);
    ctx.putImageData(imageData, 0, 0);
    
    // 新しいデータ列を右端に描画
    const binCount = frequencyData.length;
    const barHeight = canvas.height / binCount;
    
    for (let i = 0; i < binCount; i++) {
        const value = frequencyData[i];
        const y = canvas.height - ((i + 1) * barHeight);
        
        // 音量に基づいて色を設定
        ctx.fillStyle = getColor(value);
        
        // 新しいデータを右端に描画
        ctx.fillRect(canvas.width - SCROLL_SPEED, y, SCROLL_SPEED, barHeight);
    }

    // 補助線を描画
    drawGridLines();
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

function drawGridLines() {
    // 周波数の補助線
    const frequencies = [100, 500, 1000, 5000, 10000, 15000];
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    
    frequencies.forEach(freq => {
        const y = canvas.height * (1 - (freq / (sampleRate / 2)));
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        
        // 周波数ラベル
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.fillText(`${freq}Hz`, canvas.width - 45, y);
    });
    
    ctx.stroke();
}

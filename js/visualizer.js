// 音声データを解析し、Canvas上にスペクトログラムを描画するためのロジック

const mainCanvas = document.getElementById('visualizer');
const overlayCanvas = document.createElement('canvas');
mainCanvas.parentNode.appendChild(overlayCanvas);
const mainCtx = mainCanvas.getContext('2d');
const overlayCtx = overlayCanvas.getContext('2d');

let audioContext; // main.jsから設定される
let sampleRate;   // main.jsから設定される
const SCROLL_SPEED = 1; // スクロール速度（ピクセル/フレーム）

// キャンバスのサイズを設定
function resizeCanvas() {
    const container = mainCanvas.parentNode;
    mainCanvas.width = container.clientWidth;
    mainCanvas.height = container.clientHeight;
    overlayCanvas.width = container.clientWidth;
    overlayCanvas.height = container.clientHeight;
    
    // オーバーレイキャンバスの位置を設定
    overlayCanvas.style.position = 'absolute';
    overlayCanvas.style.left = mainCanvas.offsetLeft + 'px';
    overlayCanvas.style.top = mainCanvas.offsetTop + 'px';
    
    // 補助線を再描画
    drawGridLines();
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
    // メインキャンバスの内容を左にスクロール
    const imageData = mainCtx.getImageData(SCROLL_SPEED, 0, mainCanvas.width - SCROLL_SPEED, mainCanvas.height);
    mainCtx.putImageData(imageData, 0, 0);
    
    // 新しいデータを右端に描画
    const binCount = frequencyData.length;
    const barHeight = mainCanvas.height / binCount;
    
    for (let i = 0; i < binCount; i++) {
        const value = frequencyData[i];
        const y = mainCanvas.height - ((i + 1) * barHeight);
        mainCtx.fillStyle = getColor(value);
        mainCtx.fillRect(mainCanvas.width - SCROLL_SPEED, y, SCROLL_SPEED, barHeight);
    }
}

// 初期化関数
export function initVisualizer(context) {
    audioContext = context;
    sampleRate = context.sampleRate;
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 初期背景を黒で塗りつぶし
    mainCtx.fillStyle = 'black';
    mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
}

// 補助線と周波数ラベルを描画
function drawGridLines() {
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    
    const frequencies = [100, 500, 1000, 5000, 10000, 15000];
    overlayCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    overlayCtx.beginPath();
    
    frequencies.forEach(freq => {
        const y = overlayCanvas.height * (1 - (freq / (sampleRate / 2)));
        overlayCtx.moveTo(0, y);
        overlayCtx.lineTo(overlayCanvas.width, y);
        
        // 周波数ラベル
        overlayCtx.fillStyle = 'white';
        overlayCtx.font = '10px Arial';
        overlayCtx.fillText(`${freq}Hz`, overlayCanvas.width - 45, y);
    });
    
    overlayCtx.stroke();
}

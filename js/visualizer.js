// 音声データを解析し、Canvas上にスペクトログラムを描画するためのロジック

const dataCanvas = document.getElementById('visualizer');
const uiCanvas = document.createElement('canvas');
uiCanvas.id = 'ui-layer';
dataCanvas.parentNode.appendChild(uiCanvas);

const dataCtx = dataCanvas.getContext('2d');
const uiCtx = uiCanvas.getContext('2d');

let audioContext; // main.jsから設定される
let sampleRate;   // main.jsから設定される
const SCROLL_SPEED = 1; // スクロール速度（ピクセル/フレーム）

// キャンバスのサイズを設定
function resizeCanvas() {
    const container = dataCanvas.parentNode;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // データ描画用キャンバスの設定
    dataCanvas.width = width;
    dataCanvas.height = height;
    
    // UI表示用キャンバスの設定
    uiCanvas.width = width;
    uiCanvas.height = height;
    uiCanvas.style.position = 'absolute';
    uiCanvas.style.left = dataCanvas.offsetLeft + 'px';
    uiCanvas.style.top = dataCanvas.offsetTop + 'px';
    uiCanvas.style.pointerEvents = 'none'; // UI層をクリック透過に

    // 初期化
    dataCtx.fillStyle = 'black';
    dataCtx.fillRect(0, 0, width, height);
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
    // データキャンバスの内容をスクロール
    const imageData = dataCtx.getImageData(SCROLL_SPEED, 0, dataCanvas.width - SCROLL_SPEED, dataCanvas.height);
    dataCtx.putImageData(imageData, 0, 0);
    
    // 新しいデータを描画
    const binCount = frequencyData.length;
    const barHeight = dataCanvas.height / binCount;
    
    for (let i = 0; i < binCount; i++) {
        const value = frequencyData[i];
        const y = dataCanvas.height - ((i + 1) * barHeight);
        dataCtx.fillStyle = getColor(value);
        dataCtx.fillRect(dataCanvas.width - SCROLL_SPEED, y, SCROLL_SPEED, barHeight);
    }
}

// 初期化関数
export function initVisualizer(context) {
    audioContext = context;
    sampleRate = context.sampleRate;
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

// 補助線と周波数ラベルを描画
function drawGridLines() {
    uiCtx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
    
    const frequencies = [100, 500, 1000, 5000, 10000, 15000];
    uiCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    uiCtx.fillStyle = 'white';
    uiCtx.font = '10px Arial';
    
    frequencies.forEach(freq => {
        const y = uiCanvas.height * (1 - (freq / (sampleRate / 2)));
        
        // 補助線
        uiCtx.beginPath();
        uiCtx.moveTo(0, y);
        uiCtx.lineTo(uiCanvas.width - 50, y);
        uiCtx.stroke();
        
        // 周波数ラベル
        uiCtx.fillText(`${freq}Hz`, uiCanvas.width - 45, y);
    });
}

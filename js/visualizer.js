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

// 音量の履歴を保持して自動ゲイン調整に使用
const volumeHistory = new Array(50).fill(0);
let volumeIndex = 0;
let currentMaxVolume = 1;

// キャンバスのサイズを設定
function resizeCanvas() {
    const container = dataCanvas.parentNode;
    
    // 最小サイズを設定
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);

    // データ描画用キャンバスの設定
    dataCanvas.width = width;
    dataCanvas.height = height;
    dataCanvas.style.width = width + 'px';
    dataCanvas.style.height = height + 'px';
    
    // UI表示用キャンバスの設定
    uiCanvas.width = width;
    uiCanvas.height = height;
    uiCanvas.style.width = width + 'px';
    uiCanvas.style.height = height + 'px';
    uiCanvas.style.position = 'absolute';
    uiCanvas.style.left = dataCanvas.offsetLeft + 'px';
    uiCanvas.style.top = dataCanvas.offsetTop + 'px';
    uiCanvas.style.pointerEvents = 'none'; // UI層をクリック透過に

    // 初期化
    dataCtx.fillStyle = 'black';
    dataCtx.fillRect(0, 0, width, height);
    drawGridLines();
}

// 周波数を対数スケールに変換
function freqToY(freq, height) {
    const minFreq = 20;
    const maxFreq = 20000;
    const logMin = Math.log10(minFreq);
    const logMax = Math.log10(maxFreq);
    const normalized = (Math.log10(freq) - logMin) / (logMax - logMin);
    return height * (1 - normalized);
}

// Y座標を周波数に変換
function yToFreq(y, height) {
    const minFreq = 20;
    const maxFreq = 20000;
    const logMin = Math.log10(minFreq);
    const logMax = Math.log10(maxFreq);
    const normalized = 1 - (y / height);
    return Math.pow(10, normalized * (logMax - logMin) + logMin);
}

// 音量の自動調整
function updateVolumeRange(frequencies) {
    const maxInFrame = Math.max(...frequencies);
    volumeHistory[volumeIndex] = maxInFrame;
    volumeIndex = (volumeIndex + 1) % volumeHistory.length;
    
    // 直近の最大音量を計算
    const recentMaxVolume = Math.max(...volumeHistory);
    // なめらかに最大値を更新
    currentMaxVolume = currentMaxVolume * 0.95 + recentMaxVolume * 0.05;
    return currentMaxVolume;
}

// 音量を色に変換（自動ゲイン調整付き）
function getColor(value, maxVolume) {
    // 相対的な音量を計算
    const normalizedValue = Math.min(value / (maxVolume || 255), 1.0);
    
    if (normalizedValue < 0.3) {
        // 小さい音量（緑）
        return `rgb(0, ${Math.floor(255 * (normalizedValue / 0.3))}, 0)`;
    } else if (normalizedValue < 0.6) {
        // 中間音量（緑→黄）
        const factor = (normalizedValue - 0.3) / 0.3;
        return `rgb(${Math.floor(255 * factor)}, 255, 0)`;
    } else {
        // 大きい音量（黄→赤）
        const factor = (normalizedValue - 0.6) / 0.4;
        return `rgb(255, ${Math.floor(255 * (1 - factor))}, 0)`;
    }
}

// スペクトログラムを描画
export function drawVisualizer(frequencyData) {
    if (dataCanvas.width <= 0 || dataCanvas.height <= 0) {
        console.warn('キャンバスのサイズが不正です');
        return;
    }

    const maxVolume = updateVolumeRange(frequencyData);
    
    // データキャンバスの内容をスクロール
    try {
        const imageData = dataCtx.getImageData(SCROLL_SPEED, 0, dataCanvas.width - SCROLL_SPEED, dataCanvas.height);
        dataCtx.putImageData(imageData, 0, 0);
    } catch (err) {
        console.error('描画エラー:', err);
    }
    
    // 新しいデータを描画（対数スケールで）
    const binCount = frequencyData.length;
    for (let i = 0; i < binCount; i++) {
        const freq = (i / binCount) * (sampleRate / 2);
        const y = freqToY(freq, dataCanvas.height);
        const value = frequencyData[i];
        
        dataCtx.fillStyle = getColor(value, maxVolume);
        const nextFreq = ((i + 1) / binCount) * (sampleRate / 2);
        const nextY = freqToY(nextFreq, dataCanvas.height);
        const height = Math.abs(nextY - y);
        
        dataCtx.fillRect(dataCanvas.width - SCROLL_SPEED, y, SCROLL_SPEED, height);
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
    
    // 主要な周波数を対数スケールで表示
    const frequencies = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
    uiCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    uiCtx.fillStyle = 'white';
    uiCtx.font = '10px Arial';
    
    frequencies.forEach(freq => {
        const y = freqToY(freq, uiCanvas.height);
        
        // 補助線
        uiCtx.beginPath();
        uiCtx.moveTo(0, y);
        uiCtx.lineTo(uiCanvas.width - 50, y);
        uiCtx.stroke();
        
        // 周波数ラベル
        const label = freq >= 1000 ? `${freq/1000}k` : freq;
        uiCtx.fillText(`${label}Hz`, uiCanvas.width - 45, y);
    });
}
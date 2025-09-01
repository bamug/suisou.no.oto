import { initVisualizer, drawVisualizer } from './visualizer.js';

// アプリケーションのエントリーポイント

let audioContext;
let analyser;
let source;
let dataArray;

const startButton = document.getElementById('startButton');

startButton.addEventListener('click', () => {
    if (!audioContext) {
        initAudio();
    }
    // ユーザー操作によってオーディオコンテキストを開始/再開
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    startButton.disabled = true;
    startButton.textContent = '解析中...';
});

// マイクから音声データを取得するための関数
async function initAudio() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // visualizerにAudioContextを渡して初期化
        initVisualizer(audioContext);

        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048; // FFTサイズ (周波数解像度)
        analyser.smoothingTimeConstant = 0.8; // スムージング

        source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        renderFrame();

    } catch (err) {
        console.error('マイクの取得に失敗しました:', err);
        alert('マイクへのアクセスが許可されませんでした。');
        startButton.disabled = false;
        startButton.textContent = '開始';
    }
}

// 音声データを取得してCanvasに描画する関数
function renderFrame() {
    requestAnimationFrame(renderFrame);
    analyser.getByteFrequencyData(dataArray);
    drawVisualizer(dataArray);
}
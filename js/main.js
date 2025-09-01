import { initVisualizer, drawVisualizer } from './visualizer.js';

// アプリケーションのエントリーポイント

let audioContext;
let analyser;
let source;
let dataArray;

const startButton = document.getElementById('startButton');

startButton.addEventListener('click', async () => {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }
        
        await initAudio();
        startButton.disabled = true;
        startButton.textContent = '解析中...';
    } catch (err) {
        console.error('初期化エラー:', err);
        startButton.disabled = false;
    }
});

// マイクから音声データを取得するための関数
async function initAudio() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048; // FFTサイズ (周波数解像度)
        analyser.smoothingTimeConstant = 0.8; // スムージング

        source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        // visualizerの初期化を確実に行う
        initVisualizer(audioContext);

        renderFrame();

    } catch (err) {
        console.error('マイクの取得に失敗しました:', err);
        alert('マイクへのアクセスが許可されませんでした。');
        startButton.disabled = false;
        startButton.textContent = '開始';
        throw err;
    }
}

// 音声データを取得してCanvasに描画する関数
function renderFrame() {
    requestAnimationFrame(renderFrame);
    analyser.getByteFrequencyData(dataArray);
    drawVisualizer(dataArray);
}
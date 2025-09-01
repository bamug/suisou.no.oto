// アプリケーションのエントリーポイント

// Web Audio APIのコンテキストを作成
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// マイクから音声データを取得するための関数
async function initAudio() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        
        // 音声データをアナライザーに接続
        source.connect(analyser);
        analyser.fftSize = 2048;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // 音声データを取得して描画する関数を呼び出す
        draw(analyser, dataArray);
    } catch (error) {
        console.error('マイクのアクセスに失敗しました:', error);
    }
}

// 音声データを取得してCanvasに描画する関数
function draw(analyser, dataArray) {
    requestAnimationFrame(() => draw(analyser, dataArray));

    analyser.getByteFrequencyData(dataArray);

    // visualizer.jsで描画処理を行うための関数を呼び出す
    // ここでdataArrayを引数として渡す
    drawVisualizer(dataArray);
}

// ページが読み込まれたときに音声解析を初期化
window.onload = initAudio;
const URL = "../../my_model/";

let model, webcam, labelContainer, labelContainer2, maxPredictions, video;
var speech = new SpeechSynthesisUtterance();
var curentText = ''
var type = 'webcam'
var isFull = false
var idTimeout
var time = 0
var textold = ''


// Load the image model and setup the webcam
async function init() {

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    labelContainer2 = document.getElementById("label-container2");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }

}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

init()

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element

    // const prediction = await model.predict(video);
    const prediction = await model.predict(webcam.canvas);

    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability.toFixed(2) > 0.90) {
            const classPrediction =
                prediction[i].className
            labelContainer.innerHTML = classPrediction.replace("This is the flag of", "");

            // if ('speechSynthesis' in window && prediction[i].className !== curentText) {
            //     clearTimeout(idTimeout)
            //     idTimeout = setTimeout(() => {
            //         if (prediction[i].className !== 'Môi trường') {
            //             speech.lang = 'en-US';
            //             speech.text = prediction[i].className
            //             speechSynthesis.speak(speech);
            //         }
            //     }, 2000);
            //     curentText = prediction[i].className
            //     continue
            // }


            curentText = prediction[i].className
        }
        if (prediction[i].className === curentText && prediction[i].probability.toFixed(2) < 0.90) {
            console.log('vao');
            labelContainer.innerHTML = ''
            time = 0
        }
    }
}


document.addEventListener('click', function () {
    window.close()
    // if (!isFull) {
    //     if (document.documentElement.requestFullscreen) {
    //         document.documentElement.requestFullscreen();
    //     } else if (document.documentElement.mozRequestFullScreen) {
    //         document.documentElement.mozRequestFullScreen();
    //     } else if (document.documentElement.webkitRequestFullscreen) {
    //         document.documentElement.webkitRequestFullscreen();
    //     } else if (document.documentElement.msRequestFullscreen) {
    //         document.documentElement.msRequestFullscreen();
    //     }
    //     isFull = true
    // }
    // else {
    //     // Kiểm tra nếu trình duyệt hỗ trợ API Fullscreen
    //     if (document.exitFullscreen) {
    //         // Thoát khỏi chế độ toàn màn hình nếu đang ở chế độ đó
    //         if (document.fullscreenElement) {
    //             document.exitFullscreen();
    //         }
    //     } else if (document.mozCancelFullScreen) { // Firefox
    //         if (document.mozFullScreenElement) {
    //             document.mozCancelFullScreen();
    //         }
    //     } else if (document.webkitExitFullscreen) { // Chrome, Safari và Opera
    //         if (document.webkitFullscreenElement) {
    //             document.webkitExitFullscreen();
    //         }
    //     } else if (document.msExitFullscreen) { // Internet Explorer/Edge
    //         if (document.msFullscreenElement) {
    //             document.msExitFullscreen();
    //         }
    //     }
    //     isFull = false
    // }
});


setInterval(() => {
    if (labelContainer.innerHTML !== '') time++
    else time = 0

    if (time === 2) {
        if ('speechSynthesis' in window && curentText !== textold) {
            if (curentText !== 'Môi trường') {
                speech.lang = 'en-US';
                speech.text = curentText
                speechSynthesis.speak(speech);
                time = 0
                textold = curentText
                labelContainer2.innerHTML = textold.replace("This is the flag of", "");
            }
        }
    }

}, 1000);
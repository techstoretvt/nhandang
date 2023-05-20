const URL = "../../my_model/";

let model, webcam, labelContainer, maxPredictions, video;
var speech = new SpeechSynthesisUtterance();
var curentText = ''
var type = 'webcam'

let types = Array.from(document.querySelectorAll('.btn-media-item'))
types[0].onclick = () => {
    types[1].classList.remove('active')
    types[2].classList.remove('active')
    types[0].classList.add('active')

    document.getElementById('image-container').innerHTML = ''
    document.getElementById('video-container').innerHTML = ''
}

types[1].onclick = () => {
    types[0].classList.remove('active')
    types[2].classList.remove('active')
    types[1].classList.add('active')

    document.getElementById('video-container').innerHTML = ''

    let inputE = document.createElement('input')
    inputE.type = 'file'
    inputE.onchange = (e) => {
        let file = e.target.files[0]
        var reader = new FileReader();
        reader.onload = function (event) {
            var url = event.target.result;
            let imgE = document.createElement('img')
            imgE.src = url

            document.getElementById('image-container').appendChild(imgE)
            e.target.classList.add('unShow')
        };

        reader.readAsDataURL(file);


    }

    document.getElementById('image-container').appendChild(inputE)
}

types[2].onclick = () => {
    types[1].classList.remove('active')
    types[0].classList.remove('active')
    types[2].classList.add('active')

    document.getElementById('image-container').innerHTML = ''

    let inputE = document.createElement('input')
    inputE.type = 'file'

    document.getElementById('video-container').appendChild(inputE)
}

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
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }

    document.querySelector('.container_btn').classList.add('unShow')
    document.querySelector('.content').classList.remove('unShow')
    // video = document.querySelector('video')
}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element

    // const prediction = await model.predict(video);
    const prediction = await model.predict(webcam.canvas);

    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability.toFixed(2) > 0.78) {
            const classPrediction =
                prediction[i].className
            labelContainer.childNodes[i].innerHTML = classPrediction;

            if ('speechSynthesis' in window && prediction[i].className !== curentText) {
                speech.text = prediction[i].className
                speechSynthesis.speak(speech);
            }

            curentText = prediction[i].className
        }
        else {
            labelContainer.childNodes[i].innerHTML = '';
        }
    }
}
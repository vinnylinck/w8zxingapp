// Using
var Capture = Windows.Media.Capture,


// Globals
    previewPanel,
    sampler,
    memoryBuffer;


// start
function start() {
    previewPanel.src = URL.createObjectURL(sampler);
    previewPanel.play();
}

// stop
function stop() {
    previewPanel.pause();
    previewPanel.src = null;
}

// flick
function flick() {
    var photoProperties = Windows.Media.MediaProperties.ImageEncodingProperties.createJpeg();
        
    memoryBuffer  = new Windows.Storage.Streams.InMemoryRandomAccessStream();
    sampler.capturePhotoToStreamAsync(photoProperties, memoryBuffer).done(function onDone() {
        console.log("Image sample collected! ");

    });
}

function initPreview() {
    previewPanel = document.getElementById("imagePreview");
    sampler = new Capture.MediaCapture();
    sampler.initializeAsync();
}

// hooking preview initialization
document.addEventListener("DOMContentLoaded", initPreview);
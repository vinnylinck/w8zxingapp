
// Using
var Capture = Windows.Media.Capture,


// Globals
    previewPanel,
    sampler,
    memoryBuffer,
    reader,
    stopped = true,
    renderLock = false;

// sampling image
function render() {
    if (!stopped && !renderLock) {
        renderLock = true;
        flick();
    }
    window.requestAnimationFrame(render);
}

// show alert message
function showMsg(m) {
    var msg = new Windows.UI.Popups.MessageDialog(m);

    msg.commands.append(new Windows.UI.Popups.UICommand("OK", function () {
        previewPanel.play();
        renderLock = false;
    }));

    msg.showAsync();
}

// decoding barcode
function readCode(decoder, pixels, format) {
    var result = reader.decode(pixels, decoder.pixelWidth, decoder.pixelHeight, format);

    if (result) {
        console.log("Found: ", result.text);
        showMsg(result.text);
        previewPanel.pause();
    } else {
        console.log("Sampling...");
        renderLock = false;
    }
}

// decode bitmap stream
function decodeBitmapStream(decoder, rawPixels) {
    var pixels, format, pixelBuffer_U8;

    switch (decoder.bitmapPixelFormat) {

        // RGBA 16
        case Windows.Graphics.Imaging.BitmapPixelFormat.rgba16:

            // allocate a typed array with the raw pixel data
            pixelBuffer_U8 = new Uint8Array(rawPixels);

            // Uint16Array provides a typed view into the raw bit pixel data
            pixels = new Uint16Array(pixelBuffer_U8.buffer);

            // defining image format
            format = (decoder.bitmapAlphaMode === Windows.Graphics.Imaging.BitmapAlphaMode.straight ? ZXing.BitmapFormat.rgba32 : ZXing.BitmapFormat.rgb32);

        // RGBA 8
        case Windows.Graphics.Imaging.BitmapPixelFormat.rgba8:
            // for 8 bit pixel, formats, just use returned pixel array.
            pixels = rawPixels;

            // defining image format
            format = (decoder.bitmapAlphaMode === Windows.Graphics.Imaging.BitmapAlphaMode.straight ? ZXing.BitmapFormat.rgba32 : ZXing.BitmapFormat.rgb32);

            // BGRA 8
        case Windows.Graphics.Imaging.BitmapPixelFormat.bgra8:
            // basically, this is still 8 bits...
            pixels = rawPixels;

            // defining image format
            format = (decoder.bitmapAlphaMode === Windows.Graphics.Imaging.BitmapAlphaMode.straight ? ZXing.BitmapFormat.bgra32 : ZXing.BitmapFormat.bgr32);
    }

    // checking barcode
    readCode(decoder, pixels, format);
}

// load stream creating a decoder
function loadStream() {
    Windows.Graphics.Imaging.BitmapDecoder.createAsync(memoryBuffer).done(function onDone(decoder) {
        if (decoder) {
            decoder.getPixelDataAsync().then(
                
                function onSuccess(pixelDataProvider) {
                    decodeBitmapStream(decoder, pixelDataProvider.detachPixelData());
                },

                function onError(e) {
                    console.error("Error decoding image: ", e.message);
                }

            );
        }
    });
}

// start
function start() {
    previewPanel.src = URL.createObjectURL(sampler);
    previewPanel.play();
    stopped = false;
    render();
}

// stop
function stop() {
    previewPanel.pause();
    previewPanel.src = "";
    stopped = true;
}

// flick
function flick() {
    var photoProperties = Windows.Media.MediaProperties.ImageEncodingProperties.createJpeg();
        
    memoryBuffer  = new Windows.Storage.Streams.InMemoryRandomAccessStream();
    sampler.capturePhotoToStreamAsync(photoProperties, memoryBuffer).done(loadStream);
}

// initializing objetcs
function initPreview() {
    previewPanel = document.getElementById("imagePreview");

    reader = new ZXing.BarcodeReader();

    sampler = new Capture.MediaCapture();
    sampler.initializeAsync();
}

// hooking preview initialization
document.addEventListener("DOMContentLoaded", initPreview);
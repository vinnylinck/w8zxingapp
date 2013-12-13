var canvas, pid, stopped, sampler, settings, mediaDevices, myDevices, localFolder, photoStorageFile, imageProps;


function render() {
    if (!stopped) {

        sampler.capturePhotoToStorageFileAsync(imageProps, photoStorageFile);

    }
}

function start() {
    if (stopped) {
        stopped = false;
        pid = window.requestAnimationFrame(render);
    }
}

function stop() {
    if (pid) {
        window.cancelAnimationFrame(pid);
    }
    stopped = true;
}

function init() {
    stopped = true;
    localFolder = Windows.Storage.ApplicationData.current.localFolder;
    
    sampler = new Windows.Media.Capture.MediaCapture();
    settings = new Windows.Media.Capture.MediaCaptureInitializationSettings();

    settings.videoDeviceId = myDevices.getAt(0).id;
    sampler.initializeAsync(settings).then(
        function onSuccess() {
            console.log('Camera has been initialized!');
        },
        function onError() {
            var msg = new Windows.UI.Popups.MessageDialog("Error initializing camera!");
            msg.showAsync();
        }
    );

    localFolder.createFileAsync("W8BARCODE.jpg", Windows.Storage.CreationCollisionOption.replaceExisting).then(
        function onSuccess(sampleFile) {
            photoStorageFile = sampleFile;
        },
        function onError() {
            var msg = new Windows.UI.Popups.MessageDialog("Error creating sample file!");
            msg.showAsync();
        }
    );


    imageProps = Windows.Media.MediaProperties.ImageEncodingProperties();
    imageProps.subtype = "JPEG";
    imageProps.width  = 640;
    imageProps.height = 480;

    canvas = document.getElementById("samplePanel");
}

// bootstrapping plugin
mediaDevices = Windows.Devices.Enumeration.DeviceInformation;
mediaDevices.findAllAsync(Windows.Devices.Enumeration.DeviceClass.videoCapture).then(
    function onSuccess(deviceInformationCollection) {
        var msg;

        myDevices = deviceInformationCollection;

        if (myDevices.length !== 1) {
            msg = new Windows.UI.Popups.MessageDialog("No Camera found!");
            msg.showAsync();
        } else {
            init();
        }
    },
    function onError() {
        var msg = new Windows.UI.Popups.MessageDialog("Error detecting camera device!");
        msg.showAsync();
    }
);
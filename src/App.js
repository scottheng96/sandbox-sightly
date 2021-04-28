import './App.css';
import React, {useRef} from "react";
import * as tf from "@tensorflow/tfjs";
import * as bodyPix from "@tensorflow-models/body-pix";
import Webcam from "react-webcam";

function App() {

  const c_height = 240;
  const c_width = 320;

  var ready = false;

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const onlyHumanCamRef = useRef(null);
  const onlyBackgroundCamRef = useRef(null);

  const outputWebcamRef = useRef(null);

  const tempCanvasRef = useRef(null);

  const bodyPixProperties = {
    //can also be ResNet archtecture
    architecture: "MobileNetV1",
    outputStride: 16,
    quantBytes: 4
  };

  const segmentationProperties = {
    flipHorizontal: false,
    internalResolution: "high",
    segmentationThreshold: 0.5,
    scoreThreshold: 0.2
  };
  

  const loadAndPredict= async() => {
    const model = await bodyPix.load(bodyPixProperties);
    console.log("body-pix model loaded");

    ready=true;
    setInterval(() => {
      filter(model); 
    }, 16);
  };

  loadAndPredict();

  const filter = async(model) => {
    //check data is available
    if ( 
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
    //get video properties
    const video = webcamRef.current.video;
    const videoHeight = video.videoHeight;
    const videoWidth = video.videoWidth;

    //set video width and height
    webcamRef.current.video.width = videoWidth;
    webcamRef.current.video.height = videoHeight;

    //set canvas width and height
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    //perform segmentation
    const personSegment = await model.segmentPerson(video);

    //INCLUDE [1] HERE
    //testing
    
    //perform masking
    const coloredPartImage = await bodyPix.toMask(personSegment);

    //draw onto canvas
    const opacity = 0.7;
    const maskBlurAmount = 0;
    const flipHorizontal = false;  

    bodyPix.drawMask(canvasRef.current,video, coloredPartImage, opacity, maskBlurAmount, flipHorizontal);
    


    //[1]
    // get the imageData from original frame
    // let humanFrame = onlyHumanCamRef.current;
    // let humanFrame_ctx = humanFrame.getContext("2d");
    // humanFrame.width = c_width;
    // humanFrame.height = c_height;
    // humanFrame_ctx.drawImage(video,0,0,c_width,c_height);

    // let backgroundFrame = onlyBackgroundCamRef.current;
    // let backgroundFrame_ctx = backgroundFrame.getContext("2d");
    // backgroundFrame.width = c_width;
    // backgroundFrame.height = c_height;
    // backgroundFrame_ctx.drawImage(video,0,0,c_width,c_height);

    // let humanImageData = humanFrame_ctx.getImageData(0,0,c_width,c_height);
    // let backgroundImageData = backgroundFrame_ctx.getImageData(0,0,c_width,c_height);

    //manipulate the pixels (only human/background)
    var pixels = personSegment.data;

    // for (var i=0;i<pixels.length;i++) {
    //   if (pixels[i] === 1) {
    //     backgroundImageData.data[i*4] = 100;
    //     backgroundImageData.data[i*4+1] = 100;
    //     backgroundImageData.data[i*4+2] = 100;
    //     backgroundImageData.data[i*4+3] = 0;
    //   }
    //   if (pixels[i]===0) {
    //     humanImageData.data[i*4] = 100;
    //     humanImageData.data[i*4+1] = 100;
    //     humanImageData.data[i*4+2] = 100;
    //     humanImageData.data[i*4+3] = 0;
    //   }
    // }

    // bodyPix.drawMask(onlyBackgroundCamRef.current,video,backgroundImageData,0,0,c_width,c_height);
    // humanFrame_ctx.putImageData(humanImageData,0,0);
    // backgroundFrame_ctx.putImageData(backgroundImageData,0,0);
  }

    //masking complete; now trying to replace with other background
    /* START: personSegment completed
    1. Split current image into person and background (only 1 person)
    2. display just person + blackedout
    3. display just background + blackedout
    multiperson is also possible, but it is slower
    */
  }

  return (
    <div className="App">
      <header className="App-header">
      <h1>Normal Webcam</h1>
        <Webcam ref={webcamRef}
        style = {{
          marginLeft: "auto",
          marginRight: "auto",
          left:0,
          right:0,
          textAlign:"center",
          zIndex:9,
          width:320,
          height:240
        }} />
        <h1>Person Segmented Webcam</h1>
        <canvas ref = {canvasRef}
          style = {{
          marginLeft: "auto",
          marginRight: "auto",
          left:0,
          right:0,
          textAlign:"center",
          zIndex:9,
          width:320,
          height:240
        }} />
        <canvas ref={tempCanvasRef} 
          style = {{
            marginLeft: "auto",
            marginRight: "auto",
            left:0,
            right:0,
            textAlign:"center",
            zIndex:9,
            width:320,
            height:240
        }} />
        {/* <h1>Only Human Webcam</h1>
        <canvas ref={onlyHumanCamRef} 
          style = {{
            marginLeft: "auto",
            marginRight: "auto",
            left:0,
            right:0,
            textAlign:"center",
            zIndex:9,
            width:320,
            height:240
        }} />
        <h1>Only Background Webcam</h1>
        <canvas ref={onlyBackgroundCamRef} 
          style = {{
            marginLeft: "auto",
            marginRight: "auto",
            left:0,
            right:0,
            textAlign:"center",
            zIndex:9,
            width:320,
            height:240
        }} />
        <h1>Output Webcam</h1>
        <canvas ref={outputWebcamRef} 
          style = {{
            marginLeft: "auto",
            marginRight: "auto",
            left:0,
            right:0,
            textAlign:"center",
            zIndex:9,
            width:320,
            height:240
        }} /> */}

      </header>
    </div>
  );
}

export default App;

import { sketch, events, string, mappers, easing, animation, colors, cache } from './utils/index.js';
import { FaceLandmarker, HandLandmarker, FilesetResolver, DrawingUtils } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

const mediaPipe = {
  landmarkers: {
    face: undefined,
    hand: undefined
  },
  results: {
    face: undefined,
    hand: undefined
  },
  lastVideoTime: -1,
  video: undefined,
}

sketch.setup(async () => {
  await createLandmarkers();

  createWebcamVideoElement();
}, { type: "webgl" } );

async function createLandmarkers() {
  const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );

  mediaPipe.landmarkers.face = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: "GPU"
    },
    outputFaceBlendshapes: true,
    runningMode: "CPU",
    numFaces: 1
  });

  mediaPipe.landmarkers.hand = await HandLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      delegate: "CPU"
    },
    runningMode: "VIDEO",
    numHands: 2
  });
}

function createWebcamVideoElement() {
  if (!!navigator.mediaDevices?.getUserMedia === false) {
    return;
  }

  // if (!mediaPipe.landmarkers.face) {
  //   console.log("Wait! faceLandmarker not loaded yet.");
  //   return;
  // }

  // if (!mediaPipe.landmarkers.hand) {
  //   console.log("Wait! handLandmarker not loaded yet.");
  //   return;
  // }

  mediaPipe.video = document.createElement("video");
  mediaPipe.video.autoplay = true;
  mediaPipe.video.playsinline = true;

  document.body.appendChild(mediaPipe.video);

  navigator.mediaDevices.getUserMedia({ video: true }).then( stream => {
    mediaPipe.video.srcObject = stream;
    mediaPipe.video.addEventListener("loadeddata", predictWebcam);
  });
}

async function predictWebcam() {
  console.log("predictWebcam", mediaPipe.video?.currentTime);

  if (isLooping() === false) {
    return
  }

  if (mediaPipe.lastVideoTime > mediaPipe.video?.currentTime) {
    return;
  }

  const startTimeMs = performance.now();

  if (mediaPipe.landmarkers.face) {
    await mediaPipe.landmarkers.face.setOptions({ runningMode: "VIDEO" });
    mediaPipe.results.face = await mediaPipe.landmarkers.face.detectForVideo(mediaPipe.video, startTimeMs);
  }

  if (mediaPipe.landmarkers.hand) {
    await mediaPipe.landmarkers.hand.setOptions({ runningMode: "VIDEO" });
    mediaPipe.results.hand = await mediaPipe.landmarkers.hand.detectForVideo(mediaPipe.video, startTimeMs);
  }

  mediaPipe.lastVideoTime = mediaPipe.video?.currentTime;

  window.requestAnimationFrame( predictWebcam );
}

sketch.draw( (time, center, favoriteColor) => {
  background(0);
  stroke(255, 0, 0);

  const W = width/2;
  const H = height/2;

  const hasFace = mediaPipe.results.face?.faceLandmarks?.length >= 1;
  const hasHand = mediaPipe.results.hand?.landmarks?.length >= 1;

  if (hasHand) {
    circle(W-50, center.y, 50)
  }

  if (hasFace) {
    circle(-W+50, center.y, 50)
  }

  point(center.x, center.y)

  orbitControl();
});

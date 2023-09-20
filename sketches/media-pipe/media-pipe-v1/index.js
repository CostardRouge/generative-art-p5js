import { sketch, events, string, mappers, easing, animation, colors, cache } from './utils/index.js';
import { FaceLandmarker, HandLandmarker, FilesetResolver, DrawingUtils } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

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

  mediaPipe.video = createCapture(VIDEO);
  mediaPipe.video.size(width, height);
  mediaPipe.video.elt.addEventListener("loadeddata", predictWebcam);
  // mediaPipe.video.hide();]

}, { type: "webgl" } );

async function createLandmarkers() {
  const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );

  mediaPipe.landmarkers.face = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: "GPU"
    },
    outputFaceBlendshapes: true,
    runningMode: "VIDEO",
    numFaces: 1
  });

  await mediaPipe.landmarkers.face.setOptions({ runningMode: "VIDEO" });

  mediaPipe.landmarkers.hand = await HandLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      delegate: "GPU"
    },
    runningMode: "VIDEO",
    numHands: 2
  });

  await mediaPipe.landmarkers.hand.setOptions({ runningMode: "VIDEO" });
}

async function predictWebcam() {
  if (isLooping() === false) {
    return
  }

  if (mediaPipe.lastVideoTime > mediaPipe.video.elt?.currentTime) {
    return;
  }

  const startTimeMs = performance.now();

  if (mediaPipe.landmarkers.face) {
    mediaPipe.results.face = await mediaPipe.landmarkers.face.detectForVideo(mediaPipe.video.elt, startTimeMs);
  }

  if (mediaPipe.landmarkers.hand) {
    // await mediaPipe.landmarkers.hand.setOptions({ runningMode: "VIDEO" });
    mediaPipe.results.hand = await mediaPipe.landmarkers.hand.detectForVideo(mediaPipe.video.elt, startTimeMs);
  }

  mediaPipe.lastVideoTime = mediaPipe.video?.currentTime;

  window.requestAnimationFrame( predictWebcam );
}

function drawHand( handLandmarks ) {
  const W = width;
  const H = height;

  push()
  translate(-W/2, -H/2)

  handLandmarks.forEach( ( {x, y, z}) => {
    strokeWeight(map(z, 0, 1, 1, 100))
    point( x * W, y * H )
  })

  pop()
}

sketch.draw( (time, center, favoriteColor) => {
  background(0);
  stroke(255, 0, 0);

  const W = width/2;
  const H = height/2;

  const hasFace = mediaPipe.results.face?.faceLandmarks?.length >= 1;
  const hasHand = mediaPipe.results.hand?.landmarks?.length >= 1;

  if (hasHand) {
    // circle(W-50, center.y, 50)

    mediaPipe.results.hand.landmarks.forEach( drawHand )

    // drawHand( mediaPipe.results.hand[0] )
  }

  if (hasFace) {
    circle(-W+50, center.y, 50)
  }

  point(center.x, center.y)

  orbitControl();
});

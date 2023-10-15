import {
  sketch,
  events,
  string,
  mappers,
  easing,
  animation,
  colors,
  cache,
} from "./utils/index.js";
import {
  FaceLandmarker,
  HandLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

const mediaPipe = {
  landmarkers: {
    face: undefined,
    hand: undefined,
  },
  results: {
    face: undefined,
    hand: undefined,
  },
  lastVideoTime: -1,
  video: undefined,
};

const hand = {
  wrist: [0],
  thumb: [1, 2, 3, 4],
  index: [5, 6, 7, 8],
  middle: [9, 10, 11, 12],
  ring: [13, 14, 15, 16],
  pink: [17, 18, 19, 20],
  palm: [0, 1, 2, 3, 5, 9, 13, 17],
};

sketch.setup(
  async () => {
    await createLandmarkers();

    mediaPipe.video = createCapture(VIDEO);
    mediaPipe.video.size(width, height);
    mediaPipe.video.elt.addEventListener("loadeddata", predictWebcam);
    mediaPipe.video.hide();
  },
  { type: "webgl" }
);

async function createLandmarkers() {
  const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );

  mediaPipe.landmarkers.face = await FaceLandmarker.createFromOptions(
    filesetResolver,
    {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
        delegate: "GPU",
      },
      outputFaceBlendshapes: true,
      runningMode: "VIDEO",
      numFaces: 1,
    }
  );

  await mediaPipe.landmarkers.face.setOptions({ runningMode: "VIDEO" });

  mediaPipe.landmarkers.hand = await HandLandmarker.createFromOptions(
    filesetResolver,
    {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numHands: 2,
    }
  );

  await mediaPipe.landmarkers.hand.setOptions({ runningMode: "VIDEO" });
}

async function predictWebcam() {
  if (isLooping() === false) {
    return;
  }

  if (mediaPipe.lastVideoTime > mediaPipe.video.elt?.currentTime) {
    return;
  }

  const startTimeMs = performance.now();

  if (mediaPipe.landmarkers.face) {
    mediaPipe.results.face = await mediaPipe.landmarkers.face.detectForVideo(
      mediaPipe.video.elt,
      startTimeMs
    );
  }

  if (mediaPipe.landmarkers.hand) {
    mediaPipe.results.hand = await mediaPipe.landmarkers.hand.detectForVideo(
      mediaPipe.video.elt,
      startTimeMs
    );
  }

  mediaPipe.lastVideoTime = mediaPipe.video?.currentTime;

  window.requestAnimationFrame(predictWebcam);
}

function drawHand(handLandmarks) {
  const W = width;
  const H = height;

  push();
  translate(-W / 2, -H / 2);

  handLandmarks.forEach(({ x, y, z }) => {
    strokeWeight(map(z, 0, 1, 3, 10));
    point(x * W, y * H);
  });

  pop();
}

function drawHandParts(handLandmarks, indexes) {
  const W = width;
  const H = height;
  const D = (W+H)/2;

  push();
  translate(-W / 2, -H / 2);

  indexes.forEach( index => {
    const { x, y, z } = handLandmarks[index];
    point(x * W, y * H, z * D);
  });

  pop();
}

function drawSpiral(
  from,
  to,
  radius = 50,
  radialStepsCount = 12,
  lengthStepsCount = 10
) {
  stroke("blue");

  point(from.x, from.y);
  point(to.x, to.y);

  const stepIncrement = 1;

  const angleStart = 0;
  const angleEnd = TAU;
  const angleStep = (angleEnd - angleStart) / radialStepsCount;

  for (let step = 0; step <= lengthStepsCount; step += stepIncrement) {
    push()
    
    const position = p5.Vector.lerp(from, to, step / lengthStepsCount);

    translate(position)

    for (let angle = 0; angle < angleEnd; angle += angleStep) {
      const anglePosition = createVector(
        sin( angle ) * radius,
        0,
        cos( angle ) * radius
      );

      point(anglePosition.x, anglePosition.y, anglePosition.z);
    }

    pop();


    // point(position.x, position.y);
  }
}

sketch.draw((time, center, favoriteColor) => {
  background(0);
  stroke(255, 0, 0);

  const W = width / 2;
  const H = height / 2;

  const hasFace = mediaPipe.results.face?.faceLandmarks?.length >= 1;
  const hasHand = mediaPipe.results.hand?.landmarks?.length >= 1;

  if (hasHand) {
    // circle(W-50, center.y, 50)

    // mediaPipe.results.hand.landmarks.forEach( drawHand )
    // mediaPipe.results.hand.landmarks.forEach((landmarks) => {
    //   // drawHandParts(landmarks, hand.index)
    //   for (const part in hand) {
    //     drawHandParts(landmarks, hand[part])
    //   }
    // });

    mediaPipe.results.hand.landmarks.forEach( landmark => {
      const W = width;
      const H = height;
      const D = (W+H)/2;

      for (const part in hand) {
        if ( part === "palm" || part === "wrist" ) {
          continue;
        }

        const handPart = hand[part];
        const handPartStartIndex = handPart[0];
        const handPartEndIndex = handPart[handPart.length -1 ];

        const handStart = createVector(
          landmark[ handPartStartIndex ].x * W,
          landmark[ handPartStartIndex ].y * H,
          landmark[ handPartStartIndex ].z * D
        );
        const handEnd = createVector(
          landmark[ handPartEndIndex ].x * W,
          landmark[ handPartEndIndex ].y * H,
          landmark[ handPartEndIndex ].z * D
        );
  
        drawSpiral(
          handStart,
          handEnd
        )
      }
    });
  }

  // drawSpiral(createVector(center.x, center.y-H/2 ), createVector(center.x, center.y+H/2));

  // if (hasFace) {
  //   circle(-W + 50, center.y, 50);
  // }

  point(center.x, center.y);

  orbitControl();
});

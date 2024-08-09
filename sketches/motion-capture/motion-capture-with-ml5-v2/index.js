import "https://unpkg.com/ml5@latest/dist/ml5.min.js";
import { sketch, events } from "./utils/index.js";

const _ml5 = {
  video: undefined,
  handPose: undefined,
  faceMesh: undefined,
  hands: [],
  faces: [],
};

function gotHands(results) {
  console.log("HANDS", results);
  
  _ml5.hands = results;
}

function gotFaces(results) {
  console.log("FACES", results);
  
  _ml5.faces = results;
}

events.register("engine-window-preload", () => {
  console.log("PRELOAD ebgine");
  
  _ml5.handPose = ml5.handPose();
  _ml5.faceMesh = ml5.faceMesh();
});

sketch.setup( () => {
  console.log("SETUP");
  
  _ml5.video = createCapture(VIDEO, { flipped: true } );
  _ml5.video.size(width, height);
  _ml5.video.hide();

setTimeout(() => {
  _ml5.handPose.detectStart(_ml5.video, gotHands);
  // _ml5.faceMesh.detectStart(_ml5.video, gotFaces);
}, 3000);

},
{
  // type: "webgl"
});

sketch.draw((time, center, favoriteColor) => {
  background(0);

  // translate(-width / 2, -height / 2);
  image(_ml5.video, 0, 0, width, height);

  console.log(_ml5.hands);
  
  // Draw all the tracked hand points
  for (let i = 0; i < _ml5.hands.length; i++) {
    const hand = _ml5.hands[i];

    console.log(hand);

    for (let j = 0; j < hand.keypoints.length; j++) {
      const keypoint = hand.keypoints[j];

      fill(0, 255, 0);
      noStroke();
      circle(keypoint.x, keypoint.y, 10);
    }
  }


  stroke(255, 0, 0);
  point(center.x, center.y);

  // orbitControl();
});

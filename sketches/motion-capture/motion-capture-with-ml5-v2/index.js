import "https://unpkg.com/ml5@latest/dist/ml5.min.js";
import { sketch, events, mappers, animation, options, string, easing, colors } from "./utils/index.js";

options.add( [
  // TRACED LINES
  {
    id: "traced-lines-extremity-dots-weight",
    type: 'slider',
    label: 'Extremity dots weight (0 to disable)',
    min: 0,
    max: 20,
    step: 1,
    defaultValue: 4,
    category: 'Traced lines'
  },
  {
    id: "traced-lines-steps",
    type: 'slider',
    label: 'Steps',
    min: 2,
    max: 255,
    step: 1,
    defaultValue: 33,
    category: 'Traced lines'
  },
  {
    id: "traced-lines-weight",
    type: 'slider',
    label: 'Stroke weight',
    min: 1,
    max: 20,
    step: 0.1,
    defaultValue: 4,
    category: 'Traced lines'
  },
  {
    id: "traced-lines-smooth",
    type: 'switch',
    label: '"Smooth"',
    defaultValue: true,
    category: 'Traced lines'
  },
  {
    id: "traced-lines-use-chunks",
    type: 'switch',
    label: 'Use chunks',
    defaultValue: false,
    category: 'Traced lines'
  },
  {
    id: "traced-lines-chunks-count",
    type: 'slider',
    label: 'Chunks count',
    min: 1,
    max: 100,
    step: 1,
    defaultValue: 1,
    category: 'Traced lines'
  },

  // TEXT
  {
    id: "text-sample-factor",
    type: 'slider',
    label: 'Text sample factor',
    min: 0.01,
    max: 1,
    step: 0.05,
    defaultValue: 0.1,
    category: 'Text'
  },
] );

const _ml5 = {
  video: undefined,
  handPose: undefined,
  faceMesh: undefined,
  hands: [],
  faces: [],
};

events.register("engine-window-preload", () => {
  _ml5.handPose = ml5.handPose({
    maxHands: 2,
    flipped: false,
    runtime: "tfjs",
    modelType: "full",
    detectorModelUrl: undefined, //default to use the tf.hub model
    landmarkModelUrl: undefined, //default to use the tf.hub model
  });
  // _ml5.faceMesh = ml5.faceMesh();
});

sketch.setup( () => {
  _ml5.video = createCapture(VIDEO, { flipped: true } );
  _ml5.video.size(width, height);
  _ml5.video.hide();
} );

const text = "012345".split("")
const trackedHandParts = [
  "wrist", "thumb_tip", "index_finger_tip", "middle_finger_tip", "ring_finger_tip", "pinky_finger_tip"
]

sketch.draw((time, center, favoriteColor) => {
  _ml5.handPose.detect(_ml5.video, results => {
    _ml5.hands = results;
  });
  // _ml5.faceMesh.detect(_ml5.video, results => {
  //   _ml5.faces = results;
  // });

  image(_ml5.video, 0, 0, width, height);
  background(0);

  const handFingers = {};

  for (let i = 0; i < _ml5.hands.length; i++) {
    const hand = _ml5.hands[i];
    const handedness = hand.handedness;

    handFingers[handedness] = handFingers[handedness] ?? [];

    trackedHandParts.forEach( trackedHandPart => {
      handFingers[handedness].push(createVector(
        hand[trackedHandPart].x,
        hand[trackedHandPart].y,
      ))
    })
  }
  
  // for (const handedness in handFingers) {
  //   beginShape();

  //   handFingers[handedness].forEach( tip => {
  //     vertex(tip.x, tip.y);
  //   })
  
  //   strokeWeight(10)
  //   stroke(favoriteColor)
  //   noFill()
  //   endShape(CLOSE)
  // }

  const W = width/2;
  const H = height/2;
  const letterSize = W/1.5

  mappers.traceVectors(
    options.get("traced-lines-steps"),
    ( progression ) => (
      animation.ease({
        values: text.map( letter => (
          string.getTextPoints({
            text: letter,
            size: letterSize,
            position: center,
            position: createVector(0, 0),
            sampleFactor: options.get("text-sample-factor"),
            font: string.fonts.sans,
          })
        ) ),
        duration: 1,
        lerpFn: mappers.lerpPoints,
        // easingFn: easing.easeInOutExpo,
        currentTime: progression*text.length,
      })
    ),
    () => {
      beginShape()
    },
    ( vector, vectorsListProgression, vectorIndexProgression ) => {
      if (handFingers?.Left?.length) {
        const position = animation.ease({
          values: handFingers.Left,
          lerpFn: p5.Vector.lerp,
          currentTime: (
            +vectorIndexProgression
          ),
          currentTime: vectorIndexProgression*6,
        })
  
        position.add( vector )

        vertex( position.x, position.y, position.z )
      }
    },
    ( vectorIndexProgression, chunkIndex = 1 ) => {
      const chunkColor = colors.rainbow({
        hueOffset: (
          vectorIndexProgression
        ),
        hueIndex: mappers.fn(noise(chunkIndex, vectorIndexProgression*2), 0, 1, -PI/2, PI/2)*16,
        opacityFactor: mappers.fn(noise(chunkIndex, vectorIndexProgression), 0, 1, 2.5, 1.5),
        opacityFactor: mappers.fn(sin(chunkIndex*0+time+vectorIndexProgression*10), -1, 1, 5, 1.5),
      })

      chunkColor.setAlpha(96)

      stroke(chunkColor)
      strokeWeight(options.get("traced-lines-weight"))
      noFill()
      endShape()
    },
    options.get("traced-lines-smooth"),
    options.get("traced-lines-use-chunks"),
    options.get("traced-lines-chunks-count")
  )
});

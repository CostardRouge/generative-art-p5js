import { events } from './index.js';

const MONITORING_BUFFER = 60;

const midi = {
  inputs: [],
  outputs: [],
  monitoring: { },
  byCircularIndex: (index, attribute = "on") => {
    const noteIdentifiers = Object.keys( midi.monitoring );

    return midi.monitoring[noteIdentifiers[ index % noteIdentifiers.length ]]?.[attribute];
  },
  setup: () => {
    WebMidi.enable()
      .then( () => {
        if (WebMidi.inputs.length < 1) {
          return console.log("No device detected.");
        }
    
        WebMidi.inputs.forEach((input, index) => {
          console.log(`INPUT: ${index}: ${input.name}`);

          midi.inputs.push(input);

          input.addListener("noteon", (e) => {
            const { identifier }  = e.note;

            if ( undefined === midi.monitoring[ identifier ] ) {
              midi.monitoring[ identifier ] = {
                history: new Array(MONITORING_BUFFER).fill(0)
              }
            }

            const noteHistory = midi.monitoring[ identifier ].history;

            // console.log(midi.monitoring[ identifier ]);

            midi.monitoring[ identifier ].history[ noteHistory.length -1 ] = identifier;
            midi.monitoring[ identifier ].on = true;
            // midi.monitoring[ identifier ].smooth = 1;
            midi.monitoring[identifier ].smooth = lerp( midi.monitoring[identifier].smooth ?? 1, 1, 0.067 );


            // console.log( "on", e.note.identifier )
          });

          input.addListener("noteoff", (e) => {
            const { identifier }  = e.note;

            if ( undefined === midi.monitoring[ identifier ] ) {
              midi.monitoring[ identifier ] = {
                history: new Array(MONITORING_BUFFER).fill(0)
              };
            }

            midi.monitoring[ identifier ].on = false;
            midi.monitoring[identifier ].smooth = lerp( midi.monitoring[identifier].smooth ?? 1, 0, 0.067 );

            console.log( "off", e.note.identifier )
          });
        });
    
        WebMidi.outputs.forEach((device, index) => {
          console.log(`OUTPUT: ${index}: ${device.name}`);

          midi.outputs.push(device);         
        });
      })
      .catch( console.error );

    events.register( "pre-draw", midi.monitor );
  },
  play: note => {
    midi.outputs.forEach( device => {
      device.playNote(note);

      // new Note("A4", {
      //   duration: 100,
      //   release: 0.1,
      // })
    });
  },
  monitor: () => {
    // console.log(midi.monitoring);

    for (const identifier in midi.monitoring) {
      midi.monitoring[identifier].history.shift();
      midi.monitoring[identifier].history.push(0);
      midi.monitoring[identifier].smooth = lerp( midi.monitoring[identifier].smooth, 0, 0.05 );
    }
  },
  //release, and attack ?
};

export default midi;

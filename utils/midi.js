import { events } from './index.js';
// import * as $C from 'https://cdn.jsdelivr.net/npm/js-combinatorics@2.1.1/combinatorics.min.js';
import * as $C from '../libraries/js-combinatorics.js';

const MONITORING_BUFFER = 60;

const midi = {
  // inputs: {},
  // outputs: {},
  monitoring: { },
  get inputs() {
    return WebMidi.inputs;
  },
  get outputs() {
    return WebMidi.outputs;
  },
  byCircularIndex: (index, attribute = "on") => {
    const noteIdentifiers = Object.keys( midi.monitoring );

    return midi.monitoring[noteIdentifiers[ index % noteIdentifiers.length ]]?.[attribute];
  },
  loadScripts: async () => {
    await loadScript("libraries/webmidi.iife.js");
    // await loadScript("libraries/js-combinatorics.js");

    // window.$C = await import('libraries/js-combinatorics.js')
  },
  setup: async () => {
    await midi.loadScripts()

    WebMidi
      .enable()
      .then( () => {
        if (WebMidi.inputs.length < 1) {
          return console.log("No device detected.");
        }

        WebMidi.inputs.forEach((input, index) => {
          const { id } = input;

          // midi.inputs[ id ] = input;
          console.log(`< INPUT: ${index}: ${input.name} (${id})`);
        })

        WebMidi.outputs.forEach((output, index) => {
          const { id } = output;

          // midi.outputs[ id ] = output;
          console.log(`> OUTPUT: ${index}: ${output.name} (${id})`);
        })

        //   midi.inputs.push(input);

        //   input.addListener("noteon", (e) => {

        //     const { identifier, name, octave }  = e.note;

        //     console.log({ identifier, name, octave }, e);


        //     if ( undefined === midi.monitoring[ identifier ] ) {
        //       midi.monitoring[ identifier ] = {
        //         history: new Array(MONITORING_BUFFER).fill(0)
        //       }
        //     }

        //     const noteHistory = midi.monitoring[ identifier ].history;

        //     // console.log(midi.monitoring[ identifier ]);

        //     midi.monitoring[ identifier ].history[ noteHistory.length -1 ] = identifier;
        //     midi.monitoring[ identifier ].on = true;
        //     midi.monitoring[ identifier ].smooth = 1;
        //     // midi.monitoring[identifier ].smooth = lerp( midi.monitoring[identifier].smooth ?? 1, 1, 0.067 );


        //     // console.log( "on", e.note.identifier )
        //   });

        //   input.addListener("noteoff", (e) => {
        //     const { identifier }  = e.note;

        //     if ( undefined === midi.monitoring[ identifier ] ) {
        //       midi.monitoring[ identifier ] = {
        //         history: new Array(MONITORING_BUFFER).fill(0)
        //       };
        //     }

        //     midi.monitoring[ identifier ].on = false;
        //     midi.monitoring[identifier ].smooth = lerp( midi.monitoring[identifier].smooth ?? 1, 0, 0.067 );

        //     console.log( "off", e.note.identifier )
        //   });
        // });
      })
      .then( midi.attachListenersToInputs )
      // .then( midi.attachListenersToOutputs )
      .catch( console.error );

    events.register( "pre-draw", midi.monitor );
  },
  play: (identifier, options = {}) => {
    midi.outputs.forEach( output => {
      const note = new Note(identifier ?? "A4", {
        duration: 350,
        release: 1,
        ...options
      })

      output.playNote(note);
    });
  },
  stop: (identifier, options = {}) => {
    midi.outputs.forEach( output => {
      // const note = new Note(identifier ?? "A4", {
      //   ...options
      // })

      // output.playNote(note);
      output.sendAllSoundOff();
    });
  },
  registerListener: (midiNoteDetail, handler, type) => {
    const noteDetailEventKey = [
      midiNoteDetail.identifier ?? 'any-note',
      midiNoteDetail.input ?? 'any-input'
    ].join("-")

    // console.log(`midi-${type}-${noteDetailEventKey}`);

    return events.register( `midi-${type}-${noteDetailEventKey}`, handler );
  },
  on: (midiNoteDetail, handler) => {
    return midi.registerListener(midiNoteDetail, handler, "on")
  },
  off: (midiNoteDetail, handler) => {
    return midi.registerListener(midiNoteDetail, handler, "off")
  },
  monitor: () => {
    for (const identifier in midi.monitoring) {
      midi.monitoring[identifier].history.shift();
      midi.monitoring[identifier].history.push(0);
      midi.monitoring[identifier].smooth = lerp( midi.monitoring[identifier].smooth, 0, 0.05 );
    }
  },
  attachListenersToInputs: () => {
    const getNoteDetails = ({
      identifier,
      name,
      octave,
      rawAttack: attack,
      _release: release
    }) => ({
      identifier,
      name,
      octave,
      attack: attack / 127,
      release
    })

    const eventHandler = ( note, type, input) => {
      const { identifier, name } = note;

      const eventKeys = new $C.CartesianProduct(
        [type],
        [identifier, name, 'any-note'],
        [input, 'any-input'],
      );

      [...eventKeys].forEach( eventKey => {
        // console.log(`midi-${eventKey.join("-")}`);
        events.handle( `midi-${eventKey.join("-")}`, note)
      })
    }

    console.log(midi.inputs);

    for (const id in midi.inputs) {
      const input = midi.inputs[ id ];

      input.addListener("noteon", event => {
        eventHandler( getNoteDetails(event.note), "on", id);
      });

      input.addListener("noteoff", event => {
        eventHandler( getNoteDetails(event.note), "off", id);
      });
    }
  },
};

export default midi;

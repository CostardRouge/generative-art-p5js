import { events } from './index.js';

const MONITORING_BUFFER = 60;

const midi = {
  inputs: {},
  outputs: {},
  monitoring: { },
  byCircularIndex: (index, attribute = "on") => {
    const noteIdentifiers = Object.keys( midi.monitoring );

    return midi.monitoring[noteIdentifiers[ index % noteIdentifiers.length ]]?.[attribute];
  },
  loadScripts: async () => {
    await loadScript("libraries/webmidi.iife.js");
  },
  setup: async () => {
    await midi.loadScripts()

    WebMidi.enable()
      .then( () => {
        if (WebMidi.inputs.length < 1) {
          return console.log("No device detected.");
        }

        WebMidi.inputs.forEach((input, index) => {
          const { id } = input;

          midi.inputs[ id ] = input;

          console.log(`< INPUT: ${index}: ${input.name} (${id})`);
        })

        WebMidi.outputs.forEach((output, index) => {
          const { id } = output;

          midi.outputs[ id ] = output;

          console.log(`> OUTPUT: ${index}: ${output.name} (${id})`);
        })
    
        // WebMidi.inputs.forEach((input, index) => {

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
  on: (note, handler, device = "all") => {
    events.register( `midi-on-${note}-${device}`, handler );
  },
  off: (note, handler, device = "all") => {
    events.register( `midi-off-${note}-${device}`, handler );
  },
  monitor: () => {
    // console.log(midi.monitoring);

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
      attack,
      release
    })

    const eventHandler = ( note, type, id) => {
      const { identifier, name } = note;

      // All
      events.handle( `midi-${type}-${identifier}-all`,  note) // A6 -  all
      events.handle( `midi-${type}-${name}-all`, note ) // A - all

      // Specific input
      events.handle( `midi-${type}-${identifier}-${id}`,  note) // A6 - specific device id
      events.handle( `midi-${type}-${name}-${id}`, note ) // A - specific device id
    }

    for (const id in midi.inputs) {
      const input = midi.inputs[ id ];

      input.addListener("noteon", event => {
        eventHandler( getNoteDetails(event.note), "on", id)
      });

      input.addListener("noteoff", event => {
        eventHandler( getNoteDetails(event.note), "off", id)
      });
    }
  },
};

export default midi;

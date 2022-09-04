import { events } from './index.js';

const ranges = {
  subBass: {
    frequencies: [20, 60],
    threshold: 0.88,
    amplifier: 0.5,
    raw: undefined,
    smooth: 0,
    corrected: undefined,
  },
  bass: {
    frequencies: [60, 250],
    threshold: 0.88,
    amplifier: 0.5,
    raw: undefined,
    smooth: 0,
    corrected: undefined,
  },
  lowMid: {
    frequencies: [250, 500],
    threshold: 0.3,
    amplifier: 0.5,
    raw: undefined,
    smooth: 0,
    corrected: undefined,
  },
  mid: {
    frequencies: [500, 2000],
    threshold: 0.3,
    amplifier: 1,
    raw: undefined,
    smooth: 0,
    corrected: undefined,
  },
  upperMid: {
    frequencies: [2000, 4000],
    threshold: 0.3,
    amplifier: 1,
    raw: undefined,
    smooth: 0,
    corrected: undefined,
  },
  presence: {
    frequencies: [4000, 6000],
    threshold: 0.0,
    amplifier: 1,
    raw: undefined,
    smooth: 0,
    corrected: undefined,
  },
  brilliance: {
    frequencies: [6000, 20000],
    threshold: 0.07,
    amplifier: 1,
    raw: undefined,
    smooth: 0,
    corrected: undefined
  }
};

const rangeNames = Object.keys( ranges );

const audio = {
  capture: {
    audioIn: undefined,
    fft: undefined,
    smoothness: 0.5,
    bins: 2048,
    setup: (smoothness = audio.capture.smoothness, bins = audio.capture.bins) => {
      audio.capture.audioIn = new p5.AudioIn();
      audio.capture.fft = new p5.FFT(smoothness, bins);

      userStartAudio();
  
      audio.capture.audioIn.start();
      audio.capture.fft.setInput(audio.capture.audioIn);
  
      console.log({
        AudioIn: audio.capture.audioIn,
        FFT: audio.capture.fft
      });

      events.register("pre-draw", audio.capture.energy.compute );
    },
    energy: {
      byIndex: (index, attribute = "smooth") => (
        ranges[rangeNames[ index ]]?.[attribute] 
      ),
      byCircularIndex: (index, attribute = "smooth") => (
        ranges[rangeNames[ index % rangeNames.length ]]?.[attribute] 
      ),
      byName: (name, attribute = "smooth") => (
        ranges[name]?.[attribute] 
      ),
      compute: () => {
        if ( false === audio.capture.audioIn?.enabled ) {
          return;
        }
      
        audio.capture.fft.analyze();
      
        for (const rangeName in ranges) {
          const range = ranges[rangeName];
      
          // range.amplifier = options.get(`audio-reactive-${rangeName}-amplifier`);
          // range.threshold = options.get(`audio-reactive-${rangeName}-threshold`);
      
          range.raw = audio.capture.fft.getEnergy( ...range.frequencies ) / 255;
          range.corrected = range.raw * range.amplifier;
      
          if ( range.raw >= range.threshold) {
            range.smooth = lerp( range.smooth, range.corrected, 0.67 );
            range.smooth = range.corrected;
          }
      
          range.smooth = lerp( range.smooth, 0, 0.067 );
        }
      },
      draw: ( spectrum = true, waveform = true ) => {
        if ( false === audio.capture.audioIn?.enabled ) {
          return;
        }
      
        if (true === waveform ) {
          const wf = audio.capture.fft.waveform();
          const w = width / audio.capture.bins;
      
          stroke('blue')
          fill('red')
          for (let i = 0; i < wf.length; i++) {
            const y = map(wf[ i ], -1, 1, height / 2, 0);
      
            rect(i * w, height / 2 - y/2, w, y );
          }
        }
      
        if (true === spectrum ) {
          const wf = audio.capture.fft.analyze();
      
          stroke('red')
          fill('blue')
          for (let i = 0; i < wf.length; i++) {
            const h = map(wf[ i ], 0, 255, 0, height/4);
            const x = map(i, 0, wf.length, 0, width);
      
            // line(i, height, i, y );
            // rect(i * w, y + height/2, w, height/2 -y );
            rect(x, height, width / wf.length, -h);
          }
        }
      }
    }
  }
};

export default audio;

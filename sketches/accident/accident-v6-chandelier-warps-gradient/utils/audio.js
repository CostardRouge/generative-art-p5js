import { events } from './index.js';

const HISTORY_BUFFER = 60;

const ranges = {
  subBass: {
    frequencies: [20, 60],
    threshold: 0.8,
    amplifier: 0.5,
    raw: undefined,
    smooth: 0,
    count: 0,
    countDeltaTime: 0,
    amplified: undefined,
  },
  bass: {
    frequencies: [60, 250],
    threshold: 0.44,
    amplifier: 0.5,
    raw: undefined,
    smooth: 0,
    count: 0,
    countDeltaTime: 0,
    amplified: undefined,
  },
  lowMid: {
    frequencies: [250, 500],
    threshold: 0.3,
    amplifier: 0.5,
    raw: undefined,
    smooth: 0,
    count: 0,
    countDeltaTime: 0,
    amplified: undefined,
  },
  mid: {
    frequencies: [500, 2000],
    threshold: 0.3,
    amplifier: 1,
    raw: undefined,
    smooth: 0,
    count: 0,
    countDeltaTime: 0,
    amplified: undefined,
  },
  upperMid: {
    frequencies: [2000, 4000],
    threshold: 0.3,
    amplifier: 10,
    raw: undefined,
    smooth: 0,
    count: 0,
    countDeltaTime: 0,
    amplified: undefined,
  },
  presence: {
    frequencies: [4000, 6000],
    threshold: 0.05,
    amplifier: 1,
    raw: undefined,
    smooth: 0,
    count: 0,
    countDeltaTime: 0,
    amplified: undefined,
  },
  brilliance: {
    frequencies: [6000, 20000],
    threshold: 0.07,
    amplifier: 1,
    raw: undefined,
    smooth: 0,
    count: 0,
    countDeltaTime: 0,
    amplified: undefined
  }
};

const rangeNames = Object.keys( ranges );

const audio = {
  capture: {
    ranges,
    audioIn: undefined,
    fft: undefined,
    history: undefined,
    historyBufferSize: HISTORY_BUFFER,
    smoothness: 0.67,
    bins: 2048,
    setup: async (smoothness = audio.capture.smoothness, bins = audio.capture.bins) => {
      userStartAudio()

      audio.capture.smoothness = smoothness ?? audio.capture.smoothness;
      audio.capture.bins = bins ?? audio.capture.bins;

      audio.capture.audioIn = new p5.AudioIn();
      audio.capture.fft = new p5.FFT(smoothness, bins);
  
      audio.capture.audioIn.start();
      audio.capture.fft.setInput(audio.capture.audioIn);
  
      // console.log({
      //   AudioIn: audio.capture.audioIn,
      //   FFT: audio.capture.fft
      // });

      events.register("pre-draw", audio.capture.energy.monitor );
    },
    energy: {
      average: (attribute = "raw") => {
        const result = (
          rangeNames.reduce( (average, rangeName, _, {length}) => {
            return average + (ranges[rangeName][attribute] / length)
          }, 0)
        );

        return isNaN(result) ? 0 : result;
      },
      byIndex: (index, attribute = "smooth") => (
        ranges[rangeNames[ index ]]?.[attribute] ?? 0
      ),
      byCircularIndex: (index, attribute = "smooth") => (
        ranges[rangeNames[ index % rangeNames.length ]]?.[attribute] ?? 0
      ),
      byName: (name, attribute = "smooth") => (
        ranges[name]?.[attribute] ?? 0
        ),
        getSpectrumHistoryFromVector: (xNormalized, yNormalized, attribute = "smooth") => {
          const binIndex = floor((audio.capture.bins -1) * xNormalized)
          const historyBufferIndex = floor((audio.capture.historyBufferSize-1) * yNormalized)
      
          const line = audio.capture.history?.spectrum[historyBufferIndex];
  
          return line?.[binIndex]
        },
        getRangeHistoryFromVector: (normalizedIndex, rangeName, attribute = "smooth") => {
          const historyBufferIndex = floor((audio.capture.historyBufferSize-1) * normalizedIndex)
      
          return audio.capture.history?.ranges[rangeName]?.[historyBufferIndex]?.[attribute]
        },
      recordHistory: () => {
        if ( false === audio.capture.audioIn?.enabled ) {
          return;
        }

        if (undefined === audio.capture.history) {
          audio.capture.history = {
            spectrum: new Array(audio.capture.historyBufferSize).fill(undefined),
            waveform: new Array(audio.capture.historyBufferSize).fill(undefined),
            ranges: (
              rangeNames.reduce( (history, rangeName, _, {length}) => {
                return {
                  ...history,
                  [rangeName]: new Array(audio.capture.historyBufferSize).fill(undefined)
                }
              }, {})
            )
          }
        }

        // HISTORY FOR SPECTRUM
        audio.capture.history.spectrum.shift();
        audio.capture.history.spectrum.push(audio.capture.fft.analyze());

        // HISTORY FOR WAVEFORM
        audio.capture.history.waveform.shift();
        audio.capture.history.waveform.push(audio.capture.fft.waveform());

        // HISTORY FOR RANGES
        for (const rangeName in audio.capture.history.ranges) {
          const range = ranges[rangeName];
          const rangeHistory = audio.capture.history.ranges[rangeName];

          if (undefined === rangeHistory) {
            return;
          }

          audio.capture.history.ranges[rangeName].shift();
          audio.capture.history.ranges[rangeName].push({
            raw: range.raw,
            smooth: range.smooth,
            amplified: range.amplified,
          });
        }
      },
      monitor: () => {
        if ( false === audio.capture.audioIn?.enabled ) {
          return;
        }
      
        audio.capture.fft.analyze();
      
        for (const rangeName in ranges) {
          const range = ranges[rangeName];

          range.raw = audio.capture.fft.getEnergy( ...range.frequencies ) / 255;
          range.amplified = range.raw * range.amplifier;

          // console.log({
          //   amp: range.amplifier,
          //   rangeName,
          //   count: range.count,
          //   index: rangeNames.indexOf( rangeName )
          // });

          if ( range.raw >= range.threshold ) {
            //range.smooth = lerp( range.smooth, range.amplified, 0.67 );
            range.smooth = range.raw;
            range.threshold = range.raw;

            const currentTime = millis();

            if ( currentTime > ( range.countDeltaTime + 500) ) {
              range.count += 1;
              range.countDeltaTime = millis();
            }
          }

          // if ( range.raw <= 0.2) {
          //   range.smooth = lerp( range.smooth, 0, 0.67 );
          // }
          range.smooth = lerp( range.smooth, 0, 0.067 );
          range.threshold = lerp( range.threshold, 0, 0.09 );
        }
      },
      draw: ( spectrum = true, waveform = true ) => {
        if ( false === audio.capture.audioIn?.enabled ) {
          return;
        }

        if ( true === waveform ) {
          const wf = audio.capture.fft.waveform();
          const w = width / audio.capture.bins;
          const h = 50

          stroke('blue')
          fill('red')
          for (let i = 0; i < wf.length; i++) {
            const y = map(wf[ i ], -1, 1, h, 0);

            rect(i * w, h - y/2, w, y );
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

window.audio = audio

export default audio;

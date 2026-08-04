import { Platform } from 'react-native';
import Sound from 'react-native-sound';

let bgSound = null;
let started = false;

const log = (msg) => {
  if (__DEV__) {
    console.log(`[Music] ${msg}`);
  }
};
const createSound = () => {
  try {
    Sound.setCategory('Playback');
  } catch (e) {
    log(`setCategory error: ${e.message}`);
  }

  try {
    bgSound = new Sound('background_music.wav', Sound.MAIN_BUNDLE, (error, props) => {
      if (error) {
        log(`load failed (${Platform.OS}): ${JSON.stringify(error)}`);
        bgSound = null;
        started = false;
        return;
      }
      log(`loaded, duration=${props && props.duration}`);
      try {
        bgSound.setNumberOfLoops(-1);
        bgSound.setVolume(0.6);
        bgSound.play();
        started = true;
      } catch (e) {
        log(`play error: ${e.message}`);
        bgSound = null;
        started = false;
      }
    });
  } catch (e) {
    log(`Sound not available: ${e.message}`);
    bgSound = null;
  }
};

export const startBackgroundMusic = () => {
  if (started) return;
  createSound();
};

export const stopBackgroundMusic = () => {
  if (bgSound) {
    try {
      bgSound.stop();
      bgSound.release();
    } catch (e) {
      log(`stop error: ${e.message}`);
    }
    bgSound = null;
  }
  started = false;
};

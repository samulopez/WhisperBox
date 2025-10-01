import { WhisperBoxApi } from './types';

declare module 'fvtt-types/configuration' {
  interface ModuleConfig {
    'whisper-box': {
      api?: WhisperBoxApi;
    };
  }

  interface SettingConfig {
    'whisper-box.openBoxOnAllWhispers': boolean;
    'whisper-box.showCharacterName': boolean;
  }
}

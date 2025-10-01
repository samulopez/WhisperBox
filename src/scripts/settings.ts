import { getGame } from './helpers';
import { MODULE_ID, MySettings } from './constants';

export const registerSettings = () => {
  getGame().settings.register(MODULE_ID, MySettings.openBoxOnAllWhispers, {
    name: 'Open box on all whispers',
    hint: 'Opens the box on whisper sending or receiving, and not just by using the button or macro',
    scope: 'client',
    config: true,
    default: false,
    type: Boolean,
  });

  getGame().settings.register(MODULE_ID, MySettings.showCharacterName, {
    name: 'Show character name on box',
    hint: "Shows the user's main character name if available",
    scope: 'client',
    config: true,
    default: true,
    type: Boolean,
  });
};

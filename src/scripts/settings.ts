import { getGame, getLocalization } from './helpers';
import { MODULE_ID, MySettings } from './constants';

export const registerSettings = () => {
  getGame().settings.register(MODULE_ID, MySettings.openBoxOnAllWhispers, {
    name: getLocalization().localize('whisper-box.settings.openBoxOnAllWhispers.name'),
    hint: getLocalization().localize('whisper-box.settings.openBoxOnAllWhispers.hint'),
    scope: 'client',
    config: true,
    default: false,
    type: Boolean,
  });

  getGame().settings.register(MODULE_ID, MySettings.showCharacterName, {
    name: getLocalization().localize('whisper-box.settings.showCharacterName.name'),
    hint: getLocalization().localize('whisper-box.settings.showCharacterName.hint'),
    scope: 'client',
    config: true,
    default: true,
    type: Boolean,
  });
};

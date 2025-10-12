import { WhisperBoxManager } from './WhisperBoxManager';
import { getGame, getLocalization } from './helpers';
import { MODULE_ID, MySettings } from './constants';

export const createWhisperBoxSelector = (whisperBoxManager: WhisperBoxManager) => {
  const content = (getGame().users?.contents ?? []).map((user) => {
    const formattedName = `${user.name}${user.character ? ` [${user.character.name}]` : ''}`;
    return `<div>
                  <input type="checkbox" id="${user.id}" name="${user.id}" data-name="${user.name}" data-character-name="${user.character?.name ?? ''}" />
                  <label for="${user.id}">${formattedName}</label>
              </div>`;
  });

  new foundry.applications.api.DialogV2({
    window: { title: getLocalization().localize('whisper-box.actions.create') },
    modal: true,
    content: `
        <fieldset>
          <legend>${getLocalization().localize('whisper-box.actions.selectUsers')}</legend>
          ${content.join('')}
      </fieldset>
      `,
    buttons: [
      {
        action: 'cancel',
        label: getLocalization().localize('whisper-box.actions.cancel'),
      },
      {
        action: 'submit',
        label: getLocalization().localize('whisper-box.actions.confirm'),
        default: true,
      },
    ],
    submit: async (result, dialog) => {
      if (result !== 'submit') return;

      const selectedUsers = Array.from(dialog.element.querySelectorAll('input[type="checkbox"]:checked')).map(
        (checkbox) => checkbox as HTMLInputElement
      );
      if (selectedUsers.length === 0) return;

      const showCharacterName = getGame().settings.get(MODULE_ID, MySettings.showCharacterName);
      const name = selectedUsers
        .map((el) => (showCharacterName && el.dataset.characterName) || el.dataset.name)
        .join(', ');

      whisperBoxManager.createWhisperBox({ name, targetUsers: selectedUsers.map((el) => el.id) });
    },
  }).render({ force: true });
};

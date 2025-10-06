import { WhisperBoxManager } from './scripts/WhisperBoxManager';
import { registerSettings } from './scripts/settings';
import { getGame, getLocalization } from './scripts/helpers';
import { MODULE_ID, MySettings } from './scripts/constants';

import './styles/style.css';

let whisperBoxManager: WhisperBoxManager;

Hooks.on('renderTokenHUD', (hudButtons, html, data) => {
  const users = getGame().users?.contents ?? [];
  // @ts-expect-error
  const targetUser = users.find((user) => user?.character?.id === data.actorId);

  if (!targetUser) {
    return;
  }

  const col = html.querySelector('.col.left');
  if (!col) return;
  const button = `<button type="button" class="control-icon whisperBox" data-tooltip="whisper-box.actions.open"><i class="fa fa-user-secret"></i></button>`;
  col.insertAdjacentHTML('beforeend', button);
  const buttonEl = html.querySelector('button.whisperBox');
  buttonEl?.addEventListener('click', async () => {
    const name =
      getGame().settings.get(MODULE_ID, MySettings.showCharacterName) && targetUser?.character?.name
        ? targetUser.character.name
        : targetUser.name;

    whisperBoxManager.createWhisperBox({
      name,
      targetUser: targetUser.id,
    });
  });
});

Hooks.on('init', () => {
  registerSettings();
});

Hooks.on('ready', () => {
  whisperBoxManager = new WhisperBoxManager();

  const whisperBoxModule = getGame().modules.get(MODULE_ID);
  if (whisperBoxModule) {
    whisperBoxModule.api = {
      createWhisperBox: whisperBoxManager.createWhisperBox.bind(whisperBoxManager),
    };
  }

  Hooks.on('renderChatMessageHTML', (data, element, context) => {
    // ignore chat card notifications
    // @ts-expect-error
    if (!context.canClose) {
      whisperBoxManager.getHistoryExistingBoxes();
    }

    if (!getGame().settings.get(MODULE_ID, MySettings.openBoxOnAllWhispers)) {
      return;
    }

    const { user } = getGame();
    if (!user) return;
    if (!data.author) return;

    if (data.whisper.length === 1 && (user.id === data.author.id || user.id === data.whisper[0])) {
      const targetUser = user.id === data.author.id && data.whisper[0] ? data.whisper[0] : data.author.id;

      const name =
        (getGame().settings.get(MODULE_ID, MySettings.showCharacterName)
          ? getGame().users?.get(targetUser)?.character?.name
          : getGame().users?.get(targetUser)?.name) ?? 'Unknown';

      whisperBoxManager.createWhisperBox({ name, targetUser });
    }
  });
});

Hooks.on('getUserContextOptions', (html, contextOptions) => {
  contextOptions.push({
    name: getLocalization().localize('whisper-box.actions.open'),
    icon: '<i class="fas fa-comments"></i>',
    condition: () => true,
    callback: (li) => {
      if (!li.dataset.userId) return;
      const user = getGame().users?.get(li.dataset.userId);
      if (!user) return;

      const name =
        getGame().settings.get(MODULE_ID, MySettings.showCharacterName) && user?.character?.name
          ? user.character.name
          : user.name;

      whisperBoxManager.createWhisperBox({ name, targetUser: user.id });
    },
  });
});

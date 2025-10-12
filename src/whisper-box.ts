import { createWhisperBoxSelector } from './scripts/whisperBoxSelector';
import { WhisperBoxManager } from './scripts/WhisperBoxManager';
import { registerSettings } from './scripts/settings';
import { getGame, getLocalization } from './scripts/helpers';
import { MODULE_ID, MySettings } from './scripts/constants';

import './styles/style.scss';

let whisperBoxManager: WhisperBoxManager;

// Adds the button to the token HUD
Hooks.on('renderTokenHUD', (hudButtons, html, data) => {
  const users = getGame().users?.contents ?? [];
  // @ts-expect-error
  const targetUser = users.find((user) => user?.character?.id === data.actorId);

  if (!targetUser) {
    return;
  }

  const col = html.querySelector('.col.left');
  if (!col) return;
  const button = `<button type="button" class="control-icon whisperBox" data-tooltip="whisper-box.actions.open"><i class="fas fa-comments"></i></button>`;
  col.insertAdjacentHTML('beforeend', button);
  const buttonEl = html.querySelector('button.whisperBox');
  buttonEl?.addEventListener('click', async () => {
    const name =
      getGame().settings.get(MODULE_ID, MySettings.showCharacterName) && targetUser?.character?.name
        ? targetUser.character.name
        : targetUser.name;

    whisperBoxManager.createWhisperBox({
      name,
      targetUsers: [targetUser.id],
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

    if (data.whisper.length > 0 && (user.id === data.author.id || data.whisper.includes(user.id))) {
      const targetUsers = user.id === data.author.id ? (data.whisper.filter((id) => id) as string[]) : [data.author.id];

      const showCharacterName = getGame().settings.get(MODULE_ID, MySettings.showCharacterName);
      const name = targetUsers
        .map((el) => {
          const targetUser = getGame().users?.get(el);
          return (
            (showCharacterName && targetUser?.character ? targetUser.character.name : targetUser?.name) ?? 'Unknown'
          );
        })
        .join(', ');

      whisperBoxManager.createWhisperBox({ name, targetUsers });
    }
  });
});

// Adds the button to the user context menu
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

      whisperBoxManager.createWhisperBox({ name, targetUsers: [user.id] });
    },
  });
});

// Adds the button next to the roll-privacy buttons
Hooks.on('renderChatInput', () => {
  const rollPrivacyDiv = document.getElementById('roll-privacy');
  if (!rollPrivacyDiv) return;

  // Avoid adding the button multiple times
  if (rollPrivacyDiv.querySelector('.ui-control.icon.fa-comments')) return;

  const whisperBoxButton = `<button type="button" class="ui-control icon fa-solid fa-comments" aria-pressed="false" data-tooltip="whisper-box.actions.open"></button>`;
  rollPrivacyDiv.children[rollPrivacyDiv.children.length - 1].insertAdjacentHTML('afterend', whisperBoxButton);
  const buttonEl = rollPrivacyDiv.querySelector('.ui-control.icon.fa-comments');
  buttonEl?.addEventListener('click', () => {
    createWhisperBoxSelector(whisperBoxManager);
  });
});

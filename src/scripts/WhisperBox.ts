import { WhisperBoxChatMessage } from '../types';

import { getGame, getLocalization } from './helpers';
import { MODULE_ID, MySettings, TEMPLATES } from './constants';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

class WhisperBox extends HandlebarsApplicationMixin(ApplicationV2) {
  data: { name: string; targetUsers: string[] };

  user: string;

  combi: string;

  content: { content: string };

  constructor(options, data: { name: string; targetUsers: string[] }) {
    super(options);
    this.data = data;
    this.user = getGame().user?.id ?? '';
    this.combi = this.data.targetUsers.join(',') + this.user;
  }

  static DEFAULT_OPTIONS = {
    classes: ['whisperBox'],
    tag: 'div',
    position: { width: 400, height: 450 },
    window: { resizable: true, minimizable: true },
  };

  static PARTS = {
    content: {
      template: TEMPLATES.whisperBox,
    },
  };

  get title() {
    return getLocalization().format('whisper-box.box.title', { name: this.data.name });
  }

  async _onRender(context, options) {
    await super._onRender(context, options);

    const dragDrop = new foundry.applications.ux.DragDrop({
      dragSelector: '.whisper-textarea',
      dropSelector: '.whisper-textarea',
      callbacks: { drop: this._onDrop.bind(this) },
    });
    dragDrop.bind(this.element);

    const whisperField = this.element.querySelector('textarea');
    if (!whisperField) return;
    whisperField.addEventListener('keyup', (event) => this._onEnterEvent(event));
    this.scrollHistory();
  }

  // The following code detects the enter key being released and then sends the message.
  async _onEnterEvent(event: KeyboardEvent) {
    if ((event.code !== 'Enter' && event.key !== 'Enter') || event.shiftKey) {
      return;
    }

    const whisper = event.target;
    if (!(whisper instanceof HTMLTextAreaElement)) return;
    const value = whisper.value.trim();
    if (!value) return;

    await foundry.documents.ChatMessage.create({
      content: value.replace(/\n/g, '<br>'),
      whisper: this.data.targetUsers,
    });
    whisper.value = '';
    whisper.focus();
  }

  scrollHistory() {
    const whisperHistory = this.element.querySelector('ul');
    if (!whisperHistory) return;
    whisperHistory.scrollTop = whisperHistory.scrollHeight;
  }

  async _postRender(context, options) {
    await super._postRender(context, options);
    // Timeout to ensure box is rendered before scrolling
    setTimeout(() => {
      this.scrollHistory();
    }, 200);
  }

  async _prepareContext(options) {
    const relevantChatHistory =
      getGame().messages?.contents.filter(
        (msg) =>
          msg.whisper.length > 0 &&
          // the user sent the message and all the target users are in the whisper list
          ((this.user === msg.author?.id && this.data.targetUsers.every((user) => msg.whisper.includes(user))) ||
            // the user received the message
            (msg.author?.id && this.data.targetUsers.includes(msg.author.id) && msg.whisper.includes(this.user)))
      ) ?? [];

    const showCharacterName = getGame().settings.get(MODULE_ID, MySettings.showCharacterName);

    const messages: WhisperBoxChatMessage[] = await Promise.all(
      relevantChatHistory.map(async (chatMessage) => {
        if (!chatMessage.whisper[0])
          return {
            speaker: undefined,
            whisperedTo: undefined,
            content: chatMessage.content,
            className: '',
          };
        const speaker = chatMessage.speaker.alias ?? chatMessage.author?.name;
        const whisperedTo = chatMessage.whisper
          .map((message) => {
            if (!message) {
              return 'Unknown';
            }
            const user = getGame().users?.get(message);
            return showCharacterName && user?.character?.name ? user?.character?.name : user?.name;
          })
          .join(', ');
        const className = this.user === chatMessage.author?.id ? 'sent-message' : 'received-message';

        return {
          speaker,
          whisperedTo,
          content: await foundry.applications.ux.TextEditor.implementation.enrichHTML(chatMessage.content),
          className,
        };
      })
    );

    const parentContext = await super._prepareContext(options);
    return foundry.utils.mergeObject(parentContext, {
      messages,
    });
  }

  async _onDrop(event) {
    event.stopPropagation();

    const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
    if (!data) return;

    const whisperField = this.element.querySelector('textarea');
    if (!whisperField) return;

    const contentLink = await foundry.applications.ux.TextEditor.implementation.getContentLink(data);
    if (!contentLink) return;

    whisperField.value += contentLink;
    whisperField.focus();
  }
}

export { WhisperBox };

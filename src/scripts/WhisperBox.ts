import { getGame } from './helpers';
import { TEMPLATES } from './constants';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

class WhisperBox extends HandlebarsApplicationMixin(ApplicationV2) {
  data: { name: string; targetUser: string };

  user: string;

  combi: string;

  content: { content: string };

  constructor(options, data: { name: string; targetUser: string }) {
    super(options);
    this.data = data;
    this.user = getGame().user?.id ?? '';
    this.combi = this.data.targetUser + this.user;
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
    return `Whispering to ${this.data.name}`;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);

    const whisperField = this.element.querySelector('textarea');
    if (!whisperField) return;
    whisperField.addEventListener('keyup', (event) => this._onEnterEvent(event));
    this.scrollHistory();
  }

  // The following code detects the enter key being released and then sends the message.
  async _onEnterEvent(event) {
    if (event.keyCode !== 13) {
      return;
    }

    const whisper = event.target;
    await foundry.documents.ChatMessage.create({
      content: whisper.value,
      whisper: [this.data.targetUser],
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
          (msg.whisper.length === 1 && this.user === msg.author?.id && this.data.targetUser === msg.whisper[0]) ||
          (this.data.targetUser === msg.author?.id && this.user === msg.whisper[0])
      ) ?? [];

    const messages: {
      speaker: string | undefined;
      whisperedTo: string | undefined;
      content: string;
      className: string;
    }[] = [];
    relevantChatHistory.forEach((chatMessage) => {
      if (!chatMessage.whisper[0]) return;
      const speaker = chatMessage.speaker.alias ?? chatMessage.author?.name;
      const whisperedTo =
        getGame().users?.get(chatMessage.whisper[0])?.name ?? getGame().actors?.get(chatMessage.whisper[0])?.name;
      const className = this.user === chatMessage.author?.id ? 'sent-message' : 'received-message';

      const message = {
        speaker,
        whisperedTo,
        content: chatMessage.content,
        className,
      };
      messages.push(message);
    });

    return foundry.utils.mergeObject(options, {
      messages,
    });
  }
}

export { WhisperBox };

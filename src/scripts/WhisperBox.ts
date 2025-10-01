import { getGame } from './helpers';

class WhisperBox extends foundry.appv1.api.Application {
  data: { name: string; targetUser: string };

  user: string;

  combi: string;

  content: { content: string };

  constructor(options, data: { name: string; targetUser: string }) {
    super(options);
    this.data = data;
    this.user = getGame().user?.id ?? '';
    this.combi = this.data.targetUser + this.user;

    const historyContainer = $('<div></div>');
    historyContainer.css({
      flex: '1',
      'min-height': '0',
      overflow: 'hidden',
    });

    const whisperHistory = $('<ul></ul>');
    whisperHistory.attr('id', `whisperTextHistory${this.combi}`);
    whisperHistory.css({
      'overflow-y': 'auto',
      'overflow-x': 'hidden',
      width: 'auto',
      height: 'calc(100% - 60px)',
      padding: '0',
    });

    historyContainer.append('<h2>History:</h2>');
    historyContainer.append(whisperHistory);

    const messageContainer = $('<div></div>');
    messageContainer.css({
      flex: '0 0 110px',
    });

    const whisperMessage = $('<textarea></textarea>');
    whisperMessage.attr('rows', '4');
    whisperMessage.attr('cols', '120');
    whisperMessage.attr('name', 'whisperText');
    whisperMessage.attr('id', `whisperTextId${this.combi}`);
    whisperMessage.css({
      background: 'white',
      color: 'black',
      'font-family': 'Arial',
    });

    messageContainer.append('<h2>Message:</h2>');
    messageContainer.append(whisperMessage);

    const appBody = $('<div></div>');

    appBody.append(historyContainer);
    appBody.append(messageContainer);

    this.content = {
      content: appBody.html(),
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    const whisperField = html.find(`textarea[id='whisperTextId${this.combi}']`);
    whisperField.on('keyup', (event) => this._onEnterEvent(event));
    this.getHistory();
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
    this.getHistory();
  }

  getHistory() {
    const whisperHistory = $(`#whisperTextHistory${this.combi}`);
    if (whisperHistory.length === 0) {
      return;
    }

    whisperHistory.html('');

    const relevantChatHistory =
      getGame().messages?.contents.filter(
        (msg) =>
          (msg.whisper.length === 1 && this.user === msg.author?.id && this.data.targetUser === msg.whisper[0]) ||
          (this.data.targetUser === msg.author?.id && this.user === msg.whisper[0])
      ) ?? [];

    relevantChatHistory.forEach((chatMessage) => {
      if (!chatMessage.whisper[0]) return;
      const speaker = chatMessage.speaker.alias ?? chatMessage.author?.name;
      const whisperedTo =
        getGame().users?.get(chatMessage.whisper[0])?.name ?? getGame().actors?.get(chatMessage.whisper[0])?.name;
      const left = this.user === chatMessage.author?.id ? 5 : 55;
      const right = this.data.targetUser === chatMessage.author?.id ? 5 : 55;
      const chatMessageItem =
        $(`<li class="chat-message message flexcol whisper" style="margin-right:${right}px; margin-left:${left}px">
    <header class="message-header flexrow">
        <h4 class="message-sender">${speaker}</h4>
        <span class="message-metadata">
            <span class="whisper-to">To: ${whisperedTo}</span>
        </span>
    </header>
    <div class="message-content">
        ${chatMessage.content}
    </div>
</li>`);

      whisperHistory.append(chatMessageItem);
    });

    // Timeout to ensure box is rendered before scrolling
    setTimeout(() => {
      this.scrollHistory();
    }, 200);
  }

  scrollHistory() {
    const whisperHistory = $(`#whisperTextHistory${this.combi}`);
    whisperHistory.scrollTop(whisperHistory.prop('scrollHeight'));
  }

  getData() {
    return this.content;
  }
}

export { WhisperBox };

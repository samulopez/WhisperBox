import { WhisperBox } from './WhisperBox';
import { getGame } from './helpers';

class WhisperBoxManager extends foundry.applications.api.ApplicationV2 {
  existingBoxes: Record<string, WhisperBox>;

  constructor(options = {}) {
    super(options);
    this.existingBoxes = {};
  }

  createWhisperBox(data: { name: string; targetUser: string }): void {
    const { name, targetUser } = data;

    const { user } = getGame();
    if (!user) return;

    const combi = targetUser + user.id;

    let whisperBox = this.existingBoxes[combi];
    if (!whisperBox) {
      const opt = foundry.appv1.api.Dialog.defaultOptions;
      opt.title = `Whispering to ${name}`;
      opt.width = 400;
      opt.height = 450;
      opt.minimizable = true;
      opt.resizable = true;
      opt.classes.push('whisperBox');

      whisperBox = new WhisperBox(opt, data);
      this.existingBoxes[combi] = whisperBox;
    }

    if (!whisperBox.rendered) {
      whisperBox.render(true);
    }

    whisperBox.getHistory();
  }

  getHistoryExistingBoxes() {
    Object.values(this.existingBoxes).forEach((box) => {
      box.getHistory();
    });
  }
}

export { WhisperBoxManager };

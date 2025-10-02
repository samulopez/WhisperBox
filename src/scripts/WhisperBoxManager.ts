import { WhisperBox } from './WhisperBox';
import { getGame } from './helpers';

class WhisperBoxManager extends foundry.applications.api.ApplicationV2 {
  existingBoxes: Record<string, WhisperBox>;

  constructor(options = {}) {
    super(options);
    this.existingBoxes = {};
  }

  createWhisperBox(data: { name: string; targetUser: string }): void {
    const { targetUser } = data;

    const { user } = getGame();
    if (!user) return;

    const combi = targetUser + user.id;

    let whisperBox = this.existingBoxes[combi];
    if (!whisperBox) {
      whisperBox = new WhisperBox({}, data);
      this.existingBoxes[combi] = whisperBox;
    }

    if (!whisperBox.rendered) {
      whisperBox.render({ force: true });
      return;
    }

    whisperBox.render();
  }

  getHistoryExistingBoxes() {
    Object.values(this.existingBoxes).forEach((box) => {
      box.render();
    });
  }
}

export { WhisperBoxManager };

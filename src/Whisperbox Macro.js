//This code works with WhisperBox. Save it as a macro to give yourself an alternative method
//of launching a WhisperBox that will also work for players.

const users = game.users.contents;
let selectOptions = '';
users.forEach((user) => (selectOptions += `<option value = "${user.id}">${user.name}</option>\n`));

const dp = {
  title: 'Create a WhisperBox',
  content: `Pick a user: <select id="users" name="users">${selectOptions}</select>`,
  buttons: {
    whisper: {
      label: 'Whisper',
      callback: () => {
        const uid = document.getElementById('users').value;
        const user = game.users.find((user) => user.id === uid);

        let name = user.name;

        if (game.settings.get('whisper-box', 'showCharacterName')) {
          name = user?.character?.name ?? name;
        }

        game.modules.get('whisper-box')?.api?.createWhisperBox({ name: name, targetUser: uid });
      },
    },
  },
};
const d = new foundry.appv1.api.Dialog(dp);
d.render(true);

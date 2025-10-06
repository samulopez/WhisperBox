interface LocalizationHelper {
  localize: (key: string) => string;
  format(stringId: string, data?: Record<string, string>): string;
}

export const getGame = (): foundry.Game => {
  if (!(game instanceof foundry.Game)) {
    throw new Error('game is not initialized yet!');
  }
  return game;
};

export function getLocalization(): LocalizationHelper {
  const { i18n } = getGame();
  if (!i18n) {
    return {
      localize: (key: string) => key,
      format: (stringId: string, _data?: Record<string, string>) => stringId,
    };
  }
  return i18n;
}

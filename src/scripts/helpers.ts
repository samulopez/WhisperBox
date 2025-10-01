export const getGame = (): foundry.Game => {
  if (!(game instanceof foundry.Game)) {
    throw new Error('game is not initialized yet!');
  }
  return game;
};

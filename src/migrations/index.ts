import * as migration_20260808_155113_initial from './20260808_155113_initial';

export const migrations = [
  {
    up: migration_20260808_155113_initial.up,
    down: migration_20260808_155113_initial.down,
    name: '20260808_155113_initial'
  },
];

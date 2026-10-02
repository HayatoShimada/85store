import * as migration_20261002_023105_baseline from './20261002_023105_baseline';

export const migrations = [
  {
    up: migration_20261002_023105_baseline.up,
    down: migration_20261002_023105_baseline.down,
    name: '20261002_023105_baseline'
  },
];

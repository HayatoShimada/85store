import * as migration_20261002_023105_baseline from './20261002_023105_baseline';
import * as migration_20261002_035624_store_content from './20261002_035624_store_content';

export const migrations = [
  {
    up: migration_20261002_023105_baseline.up,
    down: migration_20261002_023105_baseline.down,
    name: '20261002_023105_baseline',
  },
  {
    up: migration_20261002_035624_store_content.up,
    down: migration_20261002_035624_store_content.down,
    name: '20261002_035624_store_content'
  },
];

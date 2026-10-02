import * as migration_20261002_023105_baseline from './20261002_023105_baseline';
import * as migration_20261002_035624_store_content from './20261002_035624_store_content';
import * as migration_20261002_035938_store_content_gid from './20261002_035938_store_content_gid';
import * as migration_20261002_040223_store_menus_nesting from './20261002_040223_store_menus_nesting';

export const migrations = [
  {
    up: migration_20261002_023105_baseline.up,
    down: migration_20261002_023105_baseline.down,
    name: '20261002_023105_baseline',
  },
  {
    up: migration_20261002_035624_store_content.up,
    down: migration_20261002_035624_store_content.down,
    name: '20261002_035624_store_content',
  },
  {
    up: migration_20261002_035938_store_content_gid.up,
    down: migration_20261002_035938_store_content_gid.down,
    name: '20261002_035938_store_content_gid',
  },
  {
    up: migration_20261002_040223_store_menus_nesting.up,
    down: migration_20261002_040223_store_menus_nesting.down,
    name: '20261002_040223_store_menus_nesting'
  },
];

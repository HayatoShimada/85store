import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`shopify_collections\` ADD \`shopify_gid\` text;`)
  await db.run(sql`CREATE INDEX \`shopify_collections_shopify_shopify_gid_idx\` ON \`shopify_collections\` (\`shopify_gid\`);`)
  await db.run(sql`ALTER TABLE \`store_pages\` ADD \`shopify_gid\` text;`)
  await db.run(sql`CREATE INDEX \`store_pages_shopify_shopify_gid_idx\` ON \`store_pages\` (\`shopify_gid\`);`)
  await db.run(sql`ALTER TABLE \`store_articles\` ADD \`shopify_gid\` text;`)
  await db.run(sql`CREATE INDEX \`store_articles_shopify_shopify_gid_idx\` ON \`store_articles\` (\`shopify_gid\`);`)
  await db.run(sql`ALTER TABLE \`store_blogs\` ADD \`shopify_gid\` text;`)
  await db.run(sql`CREATE INDEX \`store_blogs_shopify_shopify_gid_idx\` ON \`store_blogs\` (\`shopify_gid\`);`)
  await db.run(sql`ALTER TABLE \`store_menus\` ADD \`shopify_gid\` text;`)
  await db.run(sql`CREATE INDEX \`store_menus_shopify_shopify_gid_idx\` ON \`store_menus\` (\`shopify_gid\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX \`shopify_collections_shopify_shopify_gid_idx\`;`)
  await db.run(sql`ALTER TABLE \`shopify_collections\` DROP COLUMN \`shopify_gid\`;`)
  await db.run(sql`DROP INDEX \`store_pages_shopify_shopify_gid_idx\`;`)
  await db.run(sql`ALTER TABLE \`store_pages\` DROP COLUMN \`shopify_gid\`;`)
  await db.run(sql`DROP INDEX \`store_articles_shopify_shopify_gid_idx\`;`)
  await db.run(sql`ALTER TABLE \`store_articles\` DROP COLUMN \`shopify_gid\`;`)
  await db.run(sql`DROP INDEX \`store_blogs_shopify_shopify_gid_idx\`;`)
  await db.run(sql`ALTER TABLE \`store_blogs\` DROP COLUMN \`shopify_gid\`;`)
  await db.run(sql`DROP INDEX \`store_menus_shopify_shopify_gid_idx\`;`)
  await db.run(sql`ALTER TABLE \`store_menus\` DROP COLUMN \`shopify_gid\`;`)
}

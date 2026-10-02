import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`store_menus_items_sub_items_sub_sub_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`type\` text DEFAULT 'HTTP' NOT NULL,
  	\`url\` text,
  	\`resource_id\` text,
  	\`item_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`store_menus_items_sub_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`store_menus_items_sub_items_sub_sub_items_order_idx\` ON \`store_menus_items_sub_items_sub_sub_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`store_menus_items_sub_items_sub_sub_items_parent_id_idx\` ON \`store_menus_items_sub_items_sub_sub_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`store_menus_items_sub_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`type\` text DEFAULT 'HTTP' NOT NULL,
  	\`url\` text,
  	\`resource_id\` text,
  	\`item_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`store_menus_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`store_menus_items_sub_items_order_idx\` ON \`store_menus_items_sub_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`store_menus_items_sub_items_parent_id_idx\` ON \`store_menus_items_sub_items\` (\`_parent_id\`);`)
  await db.run(sql`DROP TABLE \`store_menus_items_items_items\`;`)
  await db.run(sql`DROP TABLE \`store_menus_items_items\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`store_menus_items_items_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`type\` text DEFAULT 'HTTP' NOT NULL,
  	\`url\` text,
  	\`resource_id\` text,
  	\`item_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`store_menus_items_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`store_menus_items_items_items_order_idx\` ON \`store_menus_items_items_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`store_menus_items_items_items_parent_id_idx\` ON \`store_menus_items_items_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`store_menus_items_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`type\` text DEFAULT 'HTTP' NOT NULL,
  	\`url\` text,
  	\`resource_id\` text,
  	\`item_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`store_menus_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`store_menus_items_items_order_idx\` ON \`store_menus_items_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`store_menus_items_items_parent_id_idx\` ON \`store_menus_items_items\` (\`_parent_id\`);`)
  await db.run(sql`DROP TABLE \`store_menus_items_sub_items_sub_sub_items\`;`)
  await db.run(sql`DROP TABLE \`store_menus_items_sub_items\`;`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`shopify_collections_rules\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`column\` text DEFAULT 'TITLE',
  	\`relation\` text DEFAULT 'CONTAINS',
  	\`condition\` text,
  	\`condition_label\` text,
  	\`condition_object_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`shopify_collections\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`shopify_collections_rules_order_idx\` ON \`shopify_collections_rules\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`shopify_collections_rules_parent_id_idx\` ON \`shopify_collections_rules\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`shopify_collections\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`kind\` text DEFAULT 'smart' NOT NULL,
  	\`title\` text NOT NULL,
  	\`handle\` text,
  	\`description_html_mode\` text DEFAULT 'visual',
  	\`description_html_rich\` text,
  	\`description_html\` text,
  	\`image_id\` integer,
  	\`image_url\` text,
  	\`image_alt\` text,
  	\`sort_order\` text DEFAULT 'BEST_SELLING' NOT NULL,
  	\`applied_disjunctively\` integer DEFAULT false,
  	\`seo_title\` text,
  	\`seo_description\` text,
  	\`template_suffix\` text,
  	\`shopify_sync_status\` text,
  	\`shopify_sync_message\` text,
  	\`shopify_resolve\` text,
  	\`shopify_updated_at\` text,
  	\`shopify_last_synced_at\` text,
  	\`shopify_fingerprint\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`shopify_collections_image_idx\` ON \`shopify_collections\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`shopify_collections_updated_at_idx\` ON \`shopify_collections\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`shopify_collections_created_at_idx\` ON \`shopify_collections\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`shopify_collections_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`products_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`shopify_collections\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`shopify_collections_rels_order_idx\` ON \`shopify_collections_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`shopify_collections_rels_parent_idx\` ON \`shopify_collections_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`shopify_collections_rels_path_idx\` ON \`shopify_collections_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`shopify_collections_rels_products_id_idx\` ON \`shopify_collections_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE TABLE \`store_pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`handle\` text,
  	\`body_mode\` text DEFAULT 'visual',
  	\`body_rich\` text,
  	\`body\` text,
  	\`seo_title\` text,
  	\`seo_description\` text,
  	\`is_published\` integer DEFAULT false,
  	\`template_suffix\` text,
  	\`shopify_sync_status\` text,
  	\`shopify_sync_message\` text,
  	\`shopify_resolve\` text,
  	\`shopify_updated_at\` text,
  	\`shopify_last_synced_at\` text,
  	\`shopify_fingerprint\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`store_pages_updated_at_idx\` ON \`store_pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`store_pages_created_at_idx\` ON \`store_pages\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`store_articles\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`body_mode\` text DEFAULT 'visual',
  	\`body_rich\` text,
  	\`body\` text,
  	\`summary\` text,
  	\`image_id\` integer,
  	\`image_url\` text,
  	\`image_alt\` text,
  	\`handle\` text,
  	\`seo_title\` text,
  	\`seo_description\` text,
  	\`blog_id\` integer NOT NULL,
  	\`is_published\` integer DEFAULT false,
  	\`author\` text DEFAULT '85-Store',
  	\`template_suffix\` text,
  	\`shopify_sync_status\` text,
  	\`shopify_sync_message\` text,
  	\`shopify_resolve\` text,
  	\`shopify_updated_at\` text,
  	\`shopify_last_synced_at\` text,
  	\`shopify_fingerprint\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`blog_id\`) REFERENCES \`store_blogs\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`store_articles_image_idx\` ON \`store_articles\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`store_articles_blog_idx\` ON \`store_articles\` (\`blog_id\`);`)
  await db.run(sql`CREATE INDEX \`store_articles_updated_at_idx\` ON \`store_articles\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`store_articles_created_at_idx\` ON \`store_articles\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`store_articles_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`store_articles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`store_articles_texts_order_parent\` ON \`store_articles_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`store_blogs\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`handle\` text,
  	\`comment_policy\` text DEFAULT 'CLOSED' NOT NULL,
  	\`template_suffix\` text,
  	\`shopify_sync_status\` text,
  	\`shopify_sync_message\` text,
  	\`shopify_resolve\` text,
  	\`shopify_updated_at\` text,
  	\`shopify_last_synced_at\` text,
  	\`shopify_fingerprint\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`store_blogs_updated_at_idx\` ON \`store_blogs\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`store_blogs_created_at_idx\` ON \`store_blogs\` (\`created_at\`);`)
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
  await db.run(sql`CREATE TABLE \`store_menus_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`type\` text DEFAULT 'HTTP' NOT NULL,
  	\`url\` text,
  	\`resource_id\` text,
  	\`item_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`store_menus\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`store_menus_items_order_idx\` ON \`store_menus_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`store_menus_items_parent_id_idx\` ON \`store_menus_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`store_menus\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`handle\` text,
  	\`is_default\` integer,
  	\`shopify_sync_status\` text,
  	\`shopify_sync_message\` text,
  	\`shopify_resolve\` text,
  	\`shopify_updated_at\` text,
  	\`shopify_last_synced_at\` text,
  	\`shopify_fingerprint\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`store_menus_updated_at_idx\` ON \`store_menus\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`store_menus_created_at_idx\` ON \`store_menus\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`store_menus_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`store_menus\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`store_menus_texts_order_parent\` ON \`store_menus_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`store_menus_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`shopify_collections_id\` integer,
  	\`products_id\` integer,
  	\`store_pages_id\` integer,
  	\`store_blogs_id\` integer,
  	\`store_articles_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`store_menus\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`shopify_collections_id\`) REFERENCES \`shopify_collections\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`store_pages_id\`) REFERENCES \`store_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`store_blogs_id\`) REFERENCES \`store_blogs\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`store_articles_id\`) REFERENCES \`store_articles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`store_menus_rels_order_idx\` ON \`store_menus_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`store_menus_rels_parent_idx\` ON \`store_menus_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`store_menus_rels_path_idx\` ON \`store_menus_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`store_menus_rels_shopify_collections_id_idx\` ON \`store_menus_rels\` (\`shopify_collections_id\`);`)
  await db.run(sql`CREATE INDEX \`store_menus_rels_products_id_idx\` ON \`store_menus_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE INDEX \`store_menus_rels_store_pages_id_idx\` ON \`store_menus_rels\` (\`store_pages_id\`);`)
  await db.run(sql`CREATE INDEX \`store_menus_rels_store_blogs_id_idx\` ON \`store_menus_rels\` (\`store_blogs_id\`);`)
  await db.run(sql`CREATE INDEX \`store_menus_rels_store_articles_id_idx\` ON \`store_menus_rels\` (\`store_articles_id\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`shopify_collections_id\` integer REFERENCES shopify_collections(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`store_pages_id\` integer REFERENCES store_pages(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`store_articles_id\` integer REFERENCES store_articles(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`store_blogs_id\` integer REFERENCES store_blogs(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`store_menus_id\` integer REFERENCES store_menus(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_shopify_collections_id_idx\` ON \`payload_locked_documents_rels\` (\`shopify_collections_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_store_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`store_pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_store_articles_id_idx\` ON \`payload_locked_documents_rels\` (\`store_articles_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_store_blogs_id_idx\` ON \`payload_locked_documents_rels\` (\`store_blogs_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_store_menus_id_idx\` ON \`payload_locked_documents_rels\` (\`store_menus_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`shopify_collections_rules\`;`)
  await db.run(sql`DROP TABLE \`shopify_collections\`;`)
  await db.run(sql`DROP TABLE \`shopify_collections_rels\`;`)
  await db.run(sql`DROP TABLE \`store_pages\`;`)
  await db.run(sql`DROP TABLE \`store_articles\`;`)
  await db.run(sql`DROP TABLE \`store_articles_texts\`;`)
  await db.run(sql`DROP TABLE \`store_blogs\`;`)
  await db.run(sql`DROP TABLE \`store_menus_items_items_items\`;`)
  await db.run(sql`DROP TABLE \`store_menus_items_items\`;`)
  await db.run(sql`DROP TABLE \`store_menus_items\`;`)
  await db.run(sql`DROP TABLE \`store_menus\`;`)
  await db.run(sql`DROP TABLE \`store_menus_texts\`;`)
  await db.run(sql`DROP TABLE \`store_menus_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`products_id\` integer,
  	\`brands_id\` integer,
  	\`product_photos_id\` integer,
  	\`posts_id\` integer,
  	\`banners_id\` integer,
  	\`categories_id\` integer,
  	\`media_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`brands_id\`) REFERENCES \`brands\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`product_photos_id\`) REFERENCES \`product_photos\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`banners_id\`) REFERENCES \`banners\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "products_id", "brands_id", "product_photos_id", "posts_id", "banners_id", "categories_id", "media_id", "users_id") SELECT "id", "order", "parent_id", "path", "products_id", "brands_id", "product_photos_id", "posts_id", "banners_id", "categories_id", "media_id", "users_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_products_id_idx\` ON \`payload_locked_documents_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_brands_id_idx\` ON \`payload_locked_documents_rels\` (\`brands_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_product_photos_id_idx\` ON \`payload_locked_documents_rels\` (\`product_photos_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_banners_id_idx\` ON \`payload_locked_documents_rels\` (\`banners_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`categories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
}

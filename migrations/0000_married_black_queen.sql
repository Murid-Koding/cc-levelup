CREATE TABLE `kategoris` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nama` text NOT NULL,
	`slug` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `kategoris_slug_idx` ON `kategoris` (`slug`);--> statement-breakpoint
CREATE TABLE `pembicaras` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nama` text NOT NULL,
	`slug` text NOT NULL,
	`bio` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pembicaras_slug_idx` ON `pembicaras` (`slug`);--> statement-breakpoint
CREATE TABLE `session_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` integer NOT NULL,
	`event_type` text NOT NULL,
	`timestamp` integer DEFAULT (unixepoch()) NOT NULL,
	`referrer` text,
	FOREIGN KEY (`session_id`) REFERENCES `sharing_sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `session_events_session_id_idx` ON `session_events` (`session_id`);--> statement-breakpoint
CREATE TABLE `session_kategoris` (
	`session_id` integer NOT NULL,
	`kategori_id` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sharing_sessions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`kategori_id`) REFERENCES `kategoris`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `session_kategoris_session_id_idx` ON `session_kategoris` (`session_id`);--> statement-breakpoint
CREATE INDEX `session_kategoris_kategori_id_idx` ON `session_kategoris` (`kategori_id`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sharing_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`judul` text NOT NULL,
	`pembicara_id` integer NOT NULL,
	`tanggal` integer NOT NULL,
	`deskripsi` text NOT NULL,
	`ringkasan` text NOT NULL,
	`youtube_video_id` text NOT NULL,
	`link_materi` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`pembicara_id`) REFERENCES `pembicaras`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sharing_sessions_slug_idx` ON `sharing_sessions` (`slug`);--> statement-breakpoint
CREATE INDEX `sharing_sessions_status_tanggal_idx` ON `sharing_sessions` (`status`,`tanggal`);
create table if not exists pictures
(
	id serial not null
		constraint pictures_pk
			primary key,
	low_res_picture bytea,
	full_res_picture bytea
);

alter table pictures owner to postgre;

create unique index if not exists pictures_id_uindex
	on pictures (id);

create table if not exists users
(
	id serial not null
		constraint users_pk
			primary key,
	firstname text not null,
	surname text not null,
	picture_id integer
		constraint picture_fk
			references pictures,
	address text not null,
	zipcode integer not null
);

alter table users owner to postgre;

create unique index if not exists users_id_uindex
	on users (id);

create table if not exists admins
(
	id serial not null
		constraint admin_pk
			primary key
);

alter table admins owner to postgre;

create unique index if not exists admin_id_uindex
	on admins (id);

create table if not exists shops
(
	id serial not null
		constraint shops_pk
			primary key,
	name text not null,
	description text,
	address text not null,
	zipcode text not null,
	logo integer
		constraint pictures_fk
			references pictures,
	website text,
	instagram text,
	twitter text,
	facebook text,
	phone text
);

alter table shops owner to postgre;

create unique index if not exists shops_id_uindex
	on shops (id);

create table if not exists receipts
(
	id serial not null
		constraint receipts_pk
			primary key,
	price_total real,
	shop_id integer not null
		constraint shops_fk
			references shops,
	user_id integer not null
		constraint users_fk
			references users
);

alter table receipts owner to postgre;

create table if not exists items
(
	id serial not null
		constraint items_pk
			primary key,
	name text not null,
	quantity integer default 1 not null,
	price_u double precision default 0.0 not null,
	receipt_id integer not null
		constraint receipts_fk
			references receipts
);

alter table items owner to postgre;

create unique index if not exists items_id_uindex
	on items (id);

create unique index if not exists receipts_id_uindex
	on receipts (id);

create table if not exists credentials
(
	id serial not null
		constraint credentials_pk
			primary key,
	email text not null,
	password text not null,
	user_id integer
		constraint users_fk
			references users,
	shop_id integer
		constraint shops_fk
			references shops,
	admin_id integer
		constraint admins_fk
			references admins,
	constraint ck_only_one_fk
		check (((user_id IS NOT NULL) AND (shop_id IS NULL) AND (admin_id IS NULL)) OR ((shop_id IS NOT NULL) AND (user_id IS NULL) AND (admin_id IS NULL)) OR ((admin_id IS NOT NULL) AND (user_id IS NULL) AND (shop_id IS NULL)))
);

alter table credentials owner to postgre;

create unique index if not exists credentials_email_uindex
	on credentials (email);

create unique index if not exists credentials_id_uindex
	on credentials (id);

create table if not exists clients
(
	id serial not null
		constraint clients_pk
			primary key,
	client_id text not null,
	client_secret text not null
);

alter table clients owner to postgre;

create unique index if not exists clients_client_id_uindex
	on clients (client_id);

create unique index if not exists clients_id_uindex
	on clients (id);

create table if not exists tokens
(
	id serial not null
		constraint tokens_pk
			primary key,
	access_token text not null,
	refresh_token text not null,
	expires_at timestamp with time zone not null,
	client_id integer not null
		constraint client_fk
			references clients,
	credential_id integer not null
		constraint credentials_fk
			references credentials
);

alter table tokens owner to postgre;

create unique index if not exists tokens_access_token_uindex
	on tokens (access_token);

create unique index if not exists tokens_id_uindex
	on tokens (id);

create unique index if not exists tokens_refresh_token_uindex
	on tokens (refresh_token);



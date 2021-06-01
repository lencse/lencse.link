CREATE TABLE users(
    id                      UUID PRIMARY KEY,
    email                   VARCHAR(1024) NOT NULL,
    username                VARCHAR(64) NOT NULL,
    password                VARCHAR(1024) NOT NULL,
    creation_date           TIMESTAMP WITH TIME ZONE NOT NULL,
    deactivation_date       TIMESTAMP WITH TIME ZONE,
    UNIQUE (email),
    UNIQUE (username)
);

----

CREATE TABLE links(
    id                      UUID PRIMARY KEY,
    short_link              VARCHAR(1024) NOT NULL,
    redirect_to             VARCHAR(4096) NOT NULL,
    created_by              UUID NOT NULL REFERENCES users(id),
    creation_date           TIMESTAMP WITH TIME ZONE NOT NULL,
    deactivation_date       TIMESTAMP WITH TIME ZONE,
    UNIQUE (short_link)
);

CREATE INDEX links_creation_date_idx ON links (creation_date);
CREATE INDEX links_redirect_to_idx ON links (redirect_to);

----

CREATE TABLE hits(
    link_id           UUID NOT NULL REFERENCES links(id),
    hit_date                TIMESTAMP WITH TIME ZONE NOT NULL
);

----

CREATE VIEW links_v AS
SELECT
    l.id AS link_id,
    l.short_link,
    l.redirect_to,
    l.creation_date,
    u.id AS user_id,
    u.email AS user_email,
    u.username AS username,
    CASE WHEN u.deactivation_date IS NULL THEN true ELSE false END AS user_active,
    (SELECT COUNT(1) FROM hits WHERE link_id = l.id) AS hit_count
FROM
    links l,
    users u
WHERE 1=1
    AND u.id = l.created_by
    AND l.deactivation_date IS NULL
;

----

CREATE VIEW active_links_v AS
SELECT
    id,
    short_link,
    redirect_to,
    creation_date
FROM
    links
WHERE 1=1
    AND deactivation_date IS NULL
;

----

CREATE SEQUENCE suggestion_s MINVALUE 0 INCREMENT 1 NO CYCLE;

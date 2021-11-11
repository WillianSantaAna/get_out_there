BEGIN;

CREATE TABLE IF NOT EXISTS public.teams_invitations
(
    inv_id serial NOT NULL,
    inv_te_id bigint NOT NULL,
    inv_code text NOT NULL UNIQUE,
    inv_active boolean NOT NULL DEFAULT TRUE,
    inv_created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (inv_id)
);

CREATE TABLE IF NOT EXISTS public.circuits
(
    cir_id serial NOT NULL,
    cir_name text NOT NULL,
    cir_coords path NOT NULL,
    cir_usr_id bigint NOT NULL,
    PRIMARY KEY (cir_id)
);

CREATE TABLE IF NOT EXISTS public.teams_circuits
(
    tc_id serial NOT NULL,
    tc_name text NOT NULL,
    tc_event_date timestamp without time zone NOT NULL,
    tc_coords path NOT NULL,
    tc_team_id bigint NOT NULL,
    tc_active boolean NOT NULL DEFAULT TRUE,
    tc_created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (tc_id)
);

CREATE TABLE IF NOT EXISTS public.exercise_types (
	ety_id serial NOT NULL,
	ety_name text NOT NULL UNIQUE,
	PRIMARY KEY (ety_id)
);

CREATE TABLE IF NOT EXISTS public.user_exercises (
	uex_id serial NOT NULL,
	uex_date timestamp without time zone NOT NULL,
	uex_usr_id bigint NOT NULL,
	uex_cir_id bigint NOT NULL,
	uex_ety_id bigint NOT NULL,
	PRIMARY KEY (uex_id)
);

CREATE TABLE IF NOT EXISTS public.team_exercises (
	tex_id serial NOT NULL,
	tex_date timestamp without time zone NOT NULL,
	tex_tea_id bigint NOT NULL,
	tex_cir_id bigint NOT NULL,
	tex_ety_id bigint NOT NULL,
	PRIMARY KEY (tex_id)
);

ALTER TABLE IF EXISTS public.teams_invitations
    ADD FOREIGN KEY (inv_te_id)
    REFERENCES public.teams (te_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;
    
ALTER TABLE IF EXISTS public.circuits
    ADD FOREIGN KEY (cir_usr_id)
    REFERENCES public.users (usr_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.teams_circuits
    ADD FOREIGN KEY (tc_team_id)
    REFERENCES public.teams (te_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.users
    ADD COLUMN IF NOT EXISTS usr_score BIGINT DEFAULT 0;
    
    
ALTER TABLE IF EXISTS public.teams
    ADD COLUMN IF NOT EXISTS te_score BIGINT DEFAULT 0;
    
ALTER TABLE IF EXISTS public.user_exercises
	ADD FOREIGN KEY (uex_usr_id) 
	REFERENCES public.users (usr_id) MATCH SIMPLE
	ON UPDATE NO ACTION
	ON DELETE NO ACTION
	NOT VALID;

ALTER TABLE IF EXISTS public.team_exercises
	ADD FOREIGN KEY (tex_te_id) 
	REFERENCES public.teams (tea_id) MATCH SIMPLE
	ON UPDATE NO ACTION
	ON DELETE NO ACTION
	NOT VALID;

ALTER TABLE IF EXISTS public.user_exercises
	ADD FOREIGN KEY (uex_cir_id)
	REFERENCES public.circuits (cir_id) MATCH SIMPLE
	ON UPDATE NO ACTION
	ON DELETE NO ACTION
	NOT VALID;

ALTER TABLE IF EXISTS public.team_exercises
	ADD FOREIGN KEY (tex_cir_id)
	REFERENCES public.circuits (cir_id) MATCH SIMPLE
	ON UPDATE NO ACTION
	ON DELETE NO ACTION
	NOT VALID;

ALTER TABLE IF EXISTS public.user_exercises
	ADD FOREIGN KEY (uex_ety_id)
	REFERENCES public.exercise_types (ety_id) MATCH SIMPLE
	ON UPDATE NO ACTION
	ON DELETE NO ACTION
	NOT VALID;

ALTER TABLE IF EXISTS public.team_exercises
	ADD FOREIGN KEY (tex_ety_id)
	REFERENCES public.exercise_types (ety_id) MATCH SIMPLE
	ON UPDATE NO ACTION
	ON DELETE NO ACTION
	NOT VALID;

END;

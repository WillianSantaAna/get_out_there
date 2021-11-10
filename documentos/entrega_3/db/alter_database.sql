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

END;

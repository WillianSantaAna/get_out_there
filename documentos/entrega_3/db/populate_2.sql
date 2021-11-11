-- POPULATE --

-- insert exercise_types
insert into exercise_types (ety_name) values ('Run');
insert into exercise_types (ety_name) values ('Bike Ride');

-- insert teams
insert into teams (te_name, te_description, te_admin_id, te_open, te_created_at) 
values ('Team1', 'Best team', 1, true, current_timestamp);
insert into teams_users (tsr_tea_id, tsr_usr_id) values (1, 1);

-- insert teams_users
insert into teams_users (tsr_tea_id, tsr_usr_id) values (1, 2);

-- insert circuits
insert into circuits (cir_name, cir_coords, cir_usr_id) 
values ('Alameda park', path('(1,2),(2,3),(3,4)'), 1);
insert into circuits (cir_name, cir_coords, cir_usr_id) 
values ('Eduardo VII park', path('(5,6),(7,8),(9,10)'), 1);

-- insert team_exercises
insert into user_exercises (uex_date, uex_usr_id, uex_cir_id, uex_ety_id)
values (timestamp '2021-12-12 15:00:00', 1, 1, 1);

-- insert user_exercises
insert into team_exercises (tex_date, tex_tea_id, tex_cir_id, tex_ety_id)
values (timestamp '2021-12-15 10:00:00', 1, 2, 2);

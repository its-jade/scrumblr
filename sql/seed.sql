-- sample data

USE scrumblr;

INSERT INTO projects (title, goals) VALUES
('Scrumblr Board', 'Team Kanban board for group project tasks');

SET @project_id = LAST_INSERT_ID();
INSERT INTO board_columns (project_id, title, position)
VALUES
(@project_id, 'To Start', 1),
(@project_id, 'In Progress', 2),
(@project_id, 'Done', 3);

INSERT INTO users (name) VALUES ('Dawson'), ('Henry'), ('Meriam'), ('Kevin'), ('Jade');

INSERT INTO tasks (board_column_id, assignee_user_id, title, description, position)
VALUES
((SELECT board_column_id FROM board_columns WHERE title='To Start' LIMIT 1),
 (SELECT user_id FROM users WHERE name='Jade' LIMIT 1),
 'Set up project', 'Break down project into tasks', 1),
((SELECT board_column_id FROM board_columns WHERE title='In Progress' LIMIT 1),
 NULL, 'Style columns', 'Tweak CSS grid layout', 1);

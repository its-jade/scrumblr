CREATE DATABASE IF NOT EXISTS scrumblr;
USE scrumblr;

-- users
CREATE TABLE users (
  user_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- project
CREATE TABLE projects (
  project_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  due_date DATE,
  goals TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- board column
CREATE TABLE board_columns (
  board_column_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(100) NOT NULL,
  position INT DEFAULT 0,
  FOREIGN KEY (project_id) REFERENCES projects(project_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- tasks
CREATE TABLE tasks (
  task_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  board_column_id BIGINT UNSIGNED NOT NULL,
  assignee_user_id BIGINT UNSIGNED NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  due_date DATE,
  position INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (board_column_id) REFERENCES board_columns(board_column_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (assignee_user_id) REFERENCES users(user_id)
    ON DELETE SET NULL ON UPDATE CASCADE
);

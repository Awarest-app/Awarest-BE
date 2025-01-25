-- 1. 테이블 초기화
TRUNCATE TABLE answer RESTART IDENTITY CASCADE;
TRUNCATE TABLE questions RESTART IDENTITY CASCADE;
TRUNCATE TABLE question_mapping RESTART IDENTITY CASCADE;
TRUNCATE TABLE subquestion RESTART IDENTITY CASCADE;

-- user sequence 초기화
TRUNCATE TABLE users RESTART IDENTITY CASCADE;
-- -- 2. users 테이블에 데이터 삽입
INSERT INTO users (username, email, age, country, password, is_oauth_user, oauth_provider, created_at) VALUES
('유민규', 'dbalsrb0810@gmail.com', 25, 'USA', 'hashed_password_1', false, NULL, NOW());

-- ('jane_smith', 'jane@example.com', 30, 'UK', 'hashed_password_2', false, NULL, NOW()),
-- ('alice_wonder', 'alice@example.com', 28, 'Canada', 'hashed_password_3', true, 'google', NOW());

-- 3. questions 테이블에 데이터 삽입
INSERT INTO questions (content, type) VALUES
('What is your age range?', 'age_range'),
('What is your current job?', 'job'),
('What is your primary goal?', 'goal'),
('How often do you exercise?', 'frequency'),
('What is your preferred workout type?', 'workout_type'),
('How many hours do you sleep daily?', 'sleep_hours'),
('What is your dietary preference?', 'diet'),
('How much time can you dedicate to training?', 'time_commitment'),
('What is your fitness level?', 'fitness_level'),
('Do you have any medical conditions?', 'medical_condition');

-- 4. question_mapping 테이블에 데이터 삽입
INSERT INTO question_mapping (category_name, category_value, weight, question_id) VALUES
('age_range', '18-22', 1, 1),
('age_range', '23-26', 1, 1),
('age_range', '27-34', 1, 1),
('age_range', '35-44', 1, 1),
('job', 'Student', 1, 2),
('job', 'Retired', 1, 2),
('job', 'Self-employed', 1, 2),
('job', 'Unemployed', 1, 2),
('goal', 'Find life direction', 2, 3),
('goal', 'Muscle Gain', 2, 3),
('goal', 'Find life direction', 2, 3),
('goal', 'Flexibility', 2, 3),
('frequency', 'Retired', 1, 4),
('frequency', '3-4 times a week', 1, 4),
('frequency', '1-2 times a week', 1, 4),
('frequency', 'Less than once a week', 1, 4),
('workout_type', 'Cardio', 1, 5),
('workout_type', 'Strength Training', 1, 5),
('workout_type', 'Yoga', 1, 5),
('workout_type', 'Pilates', 1, 5);

-- 5. subquestion 테이블에 데이터 삽입 (예약어 수정)
INSERT INTO subquestion (question_id, content, "order") VALUES
(1, 'Please specify your exact age.', 1),
(1, 'Are you under 18?', 2),
(2, 'What is your job title?', 1),
(2, 'How many years have you been in this job?', 2),
(3, 'Are you aiming for short-term or long-term goals?', 1),
(3, 'What is your main motivation?', 2),
(4, 'How many times a week do you exercise?', 1),
(4, 'What duration do you usually exercise per session?', 2),
(5, 'Do you prefer indoor or outdoor workouts?', 1),
(5, 'Do you have access to a gym?', 2),
(6, 'What is your usual bedtime?', 1),
(6, 'Do you have any sleep disorders?', 2),
(7, 'Are you vegetarian, vegan, or omnivore?', 1),
(7, 'Do you follow any specific diet plan?', 2),
(8, 'Can you exercise in the mornings or evenings?', 1),
(8, 'How many hours can you dedicate to training per day?', 2),
(9, 'How would you rate your current fitness level?', 1),
(9, 'Have you had any formal fitness training before?', 2),
(10, 'Please list any medical conditions.', 1),
(10, 'Are you currently taking any medications?', 2);

-- 6. answer 테이블에 데이터 삽입
INSERT INTO answer (subquestion_id, user_id, content, submitted_at) VALUES
(1, 1, 'I am 25 years old.', NOW()),
(2, 1, 'No, I am not under 18.', NOW()),
(3, 1, 'Engineer', NOW()),
(4, 1, '5 years in this job.', NOW()),
(5, 1, 'Short-term goals', NOW()),
(6, 1, 'Improve overall health', NOW()),
(7, 1, '3 times a week', NOW()),
(8, 1, '1 hour per session', NOW()),
(9, 1, 'Intermediate', NOW()),
(10, 1, 'None', NOW());


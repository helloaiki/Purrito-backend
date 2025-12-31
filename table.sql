--create a database for project
CREATE DATABASE purrito;

--Uses purrtio db for storage
USE purrito;

--user table
CREATE TABLE user
(
    user_id INT AUTO_INCREMENT,
    user_name VARCHAR(30) NOT NULL,
    email_address VARCHAR(60) UNIQUE,
    password VARCHAR(50),
    phone_number CHAR(11),
    PRIMARY KEY(user_id)
);



--restaurant table
USE purrito;
CREATE TABLE restaurant
(
    res_id INT AUTO_INCREMENT,
    res_name VARCHAR(30) NOT NULL,
    email_address VARCHAR(50) UNIQUE,
    password VARCHAR(50),
    street VARCHAR(50),
    city VARCHAR(20),
    postal_code CHAR(4),
    building_name VARCHAR(50),
    food_program BOOLEAN DEFAULT 0,
    res_image_path VARCHAR(200),
    PRIMARY KEY(res_id)
);


--driver table
USE purrito;
CREATE TABLE driver
(
    driver_id INT AUTO_INCREMENT,
    user_name VARCHAR(30) NOT NULL,
    email_address VARCHAR(60) UNIQUE,
    password VARCHAR(50),
    verified BOOLEAN DEFAULT 1,
    phone_number CHAR(11),
    PRIMARY KEY(driver_id)
);

--organizations for donation acceptance table

USE purrito;
CREATE TABLE organization
(
    org_id INT AUTO_INCREMENT,
    org_name VARCHAR(30) NOT NULL,
    email_address VARCHAR(50) UNIQUE,
    password VARCHAR(50),
    street VARCHAR(50),
    city VARCHAR(20),
    postal_code CHAR(4),
    building_name VARCHAR(50),
    PRIMARY KEY(org_id)
);

--contact restaurant table

USE purrito;
CREATE TABLE contact_restaurant
(
    res_id INT ,
    phone_number CHAR(11),
    PRIMARY KEY(res_id,phone_number),
    FOREIGN KEY(res_id) REFERENCES restaurant(res_id)
);

--menu table

USE purrito;

CREATE TABLE menu_item
(
    res_id INT,
    food_id INT AUTO_INCREMENT,
    name VARCHAR(50),
    course_name VARCHAR(20),
    price DECIMAL(5,3),
    food_image_path VARCHAR(200),
    PRIMARY KEY(food_id),
    FOREIGN KEY(res_id) REFERENCES restaurant(res_id)
);

--user's characteristics table
USE purrito;

CREATE TABLE character_user
(
    user_id INT ,
    trait VARCHAR(50),
    PRIMARY KEY(user_id,trait),
    FOREIGN KEY(user_id) REFERENCES user(user_id)
);

--food characteristics 

USE purrito;

CREATE TABLE food_characteristic
(
    res_id INT,
    food_id INT ,
    trait VARCHAR(50),
    PRIMARY KEY(res_id,food_id,trait),
    FOREIGN KEY(res_id) REFERENCES restaurant(res_id),
    FOREIGN KEY(food_id) REFERENCES menu_item(food_id)
);

--order table between restaurant and user
USE purrito;

CREATE TABLE order_res_user
(
    order_id INT AUTO_INCREMENT,
    user_id INT,
    res_id INT ,
    food_id INT ,
    quantity INT,
    price DECIMAL(7,2),
    PRIMARY KEY(order_id),
    FOREIGN KEY(user_id) REFERENCES user(user_id),
    FOREIGN KEY(res_id) REFERENCES restaurant(res_id),
    FOREIGN KEY(food_id) REFERENCES menu_item(food_id)
);

--rating for restaurant for particular order

USE purrito;

CREATE TABLE rating_restaurant
(
    user_id INT,
    res_id INT,
    order_id INT,
    rating INT,
    comment VARCHAR(30),
    PRIMARY KEY(user_id,res_id,order_id),
    FOREIGN KEY(user_id) REFERENCES user(user_id),
    FOREIGN KEY(res_id) REFERENCES restaurant(res_id),
    FOREIGN KEY(order_id) REFERENCES order_res_user(order_id)
);

--order table for showing the current status of order
--can have driver column null

USE purrito;

CREATE TABLE order_state
(
    order_id INT,
    driver_id INT,
    order_status VARCHAR(10),
    PRIMARY KEY(order_id),
    FOREIGN KEY(order_id) REFERENCES order_res_user(order_id),
    FOREIGN KEY(driver_id)REFERENCES driver(driver_id)
);

--table for rating driver based on an order

USE purrito;

CREATE TABLE rating_driver
(
    order_id INT,
    user_id INT,
    driver_id INT,
    rating INT,
    PRIMARY KEY(order_id),
    FOREIGN KEY(order_id) REFERENCES order_res_user(order_id),
    FOREIGN KEY(driver_id)REFERENCES driver(driver_id),
    FOREIGN KEY(user_id) REFERENCES user(user_id)  
);

--tablle for restaurants to host their leftovers

USE purrito;

CREATE TABLE leftover_available
(
    res_id INT,
    food_id INT,
    made_on DATE ,
    PRIMARY KEY(res_id,food_id),
    FOREIGN KEY(res_id) REFERENCES restaurant(res_id),
    FOREIGN KEY(food_id) REFERENCES menu_item(food_id)
);

--table for orgs taking the food

USE purrito;
CREATE TABLE leftover_taken
(
    org_id INT,
    food_id INT,
    res_id INT,
    made_on DATE,
    PRIMARY KEY(org_id,food_id,res_id),
    FOREIGN KEY(res_id) REFERENCES restaurant(res_id),
    FOREIGN KEY(food_id) REFERENCES menu_item(food_id),
    FOREIGN KEY(org_id) REFERENCES organization(org_id)
);









--testers
USE purrito;
SELECT *
FROM user;
USE purrito;
SELECT *
FROM restaurant;
USE purrito;
SELECT *
FROM driver;

USE purrito;
SELECT *
FROM organization;

USE purrito;
SELECT *
FROM contact_restaurant;

USE purrito;
SELECT *
FROM menu_item;

USE purrito;
SELECT *
FROM leftover_taken;






USE purrito;
INSERT INTO user(user_name,email_address,password,phone_number) VALUES('Jack Hill','jack@gmail.com','12345678','12345678901');

INSERT INTO restaurant
(
    res_name,
    email_address,
    password,
    street,
    city,
    postal_code,
    building_name,
    food_program,
    res_image_path
)
VALUES
(
    'Spice Garden',
    'contact@spicegarden.com',
    'hashed_password_123',
    '12/A Green Road',
    'Dhaka',
    '1205',
    'Green Plaza',
    1,
    '/images/restaurants/spice_garden.jpg'
);

USE purrito;
INSERT INTO driver
(
    user_name,
    email_address,
    password,
    verified,
    phone_number
)
VALUES
(
    'Rahim Khan',
    'rahim.khan@drivers.com',
    'hashed_password_456',
    1,
    '01712345678'
);


USE purrito;
INSERT INTO organization
(
    org_name,
    email_address,
    password,
    street,
    city,
    postal_code,
    building_name
)
VALUES
(
    'Purrito Animal Welfare',
    'contact@purrito.org',
    'hashed_password_org1',
    '45 Lake Circus',
    'Dhaka',
    '1207',
    'Lake View Tower'
);

USE purrito;
INSERT INTO contact_restaurant (res_id, phone_number)
VALUES
    (1, '01899887766'),
    (1, '01955667788');

USE purrito;
INSERT INTO menu_item (res_id, name, course_name, price)
VALUES
    (1, 'Garlic Bread', 'Starter', 3.250),
    (1, 'Chocolate Lava Cake', 'Dessert', 4.750);


USE purrito;
INSERT INTO food_characteristic (res_id, food_id, trait)
VALUES
    (1, 1, 'Gluten-Free'),
    (1, 1, 'High Protein'),
    (1, 1, 'Contains Dairy');

USE purrito;
SELECT *
FROM menu_item men
JOIN food_characteristic f ON men.food_id=f.food_id;

USE purrito;
INSERT INTO order_res_user
(user_id, res_id, food_id, quantity, price)
VALUES
(1, 1, 1, 1, 3.25000);

USE purrito;
INSERT INTO character_user(user_id,trait) VALUES(1,'Gluten-free'),(1,'High Protein'),(1,'Contains Dairy');

USE purrito;
SELECT *
FROM rating_driver;
INSERT INTO rating_restaurant
(
    user_id,
    res_id,
    order_id,
    rating,
    comment
)
VALUES
(
    1,       -- Jack Hill
    1,       -- Spice Garden
    1,       -- order_id of first order
    5,       -- rating out of 5
    'Delicious and fresh!'
);

USE purrito;
INSERT INTO order_state
(
    order_id,
    driver_id,
    order_status
)
VALUES
(
    1,       -- Jack Hill's order
    1,       -- assigned driver
    'Delivered'
);

USE purrito;
INSERT INTO rating_driver
(
    order_id,
    user_id,
    driver_id,
    rating
)
VALUES
(
    1,      -- Jack Hill's order
    1,      -- Jack Hill
    1,      -- assigned driver
    5       -- rating out of 5
);

USE purrito;
INSERT INTO leftover_available
(
    res_id,
    food_id,
    made_on
)
VALUES
(
    1,                     -- Spice Garden
    1,                     -- Garlic bread
    '2025-12-31'           -- example date
);


USE purrito;
INSERT INTO leftover_taken
(
    org_id,
    food_id,
    res_id,
    made_on
)
VALUES
(
    1,                     -- Purrito Animal Welfare
    1,                     -- Chicken Alfredo Pasta
    1,                     -- Spice Garden
    '2025-12-31'           -- date leftover was taken
);








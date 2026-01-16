--create a database for project
CREATE DATABASE purrito;

--Uses purrtio db for storage
USE purrito;

--user table
USE purrito;
CREATE TABLE user
(
    user_id INT AUTO_INCREMENT,
    user_name VARCHAR(30) NOT NULL,
    email_address VARCHAR(60) UNIQUE,
    password VARCHAR(60),
    phone_number CHAR(11),
    PRIMARY KEY(user_id)
);



--restaurant table
USE purrito;
CREATE TABLE restaurant
(
    restaurant_id INT AUTO_INCREMENT,
    res_name VARCHAR(30) NOT NULL,
    email_address VARCHAR(50) UNIQUE,
    password VARCHAR(60),
    street VARCHAR(50),
    city VARCHAR(20),
    postal_code CHAR(4),
    building_name VARCHAR(50),
    food_program BOOLEAN DEFAULT 0,
    res_image_path VARCHAR(512),
    total_sales INT,
    description VARCHAR(20),
    restaurant_type VARCHAR(20),
    PRIMARY KEY(restaurant_id)
);

--driver table
USE purrito;
CREATE TABLE driver
(
    driver_id INT AUTO_INCREMENT,
    user_name VARCHAR(30) NOT NULL,
    email_address VARCHAR(60) UNIQUE,
    password VARCHAR(60),
    verification_method VARCHAR(100),
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
    password VARCHAR(60),
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
    FOREIGN KEY(res_id) REFERENCES restaurant(restaurant_id) ON DELETE CASCADE
);

--menu table

USE purrito;
CREATE TABLE Restaurant_Menu
(
    res_id INT,
    food_id INT AUTO_INCREMENT,
    name VARCHAR(50),
    course_name VARCHAR(20),
    price DECIMAL(6,2),
    is_available BOOLEAN DEFAULT 0,
    quantity_sold INT,
    food_image_path VARCHAR(512),
    PRIMARY KEY(food_id),
    FOREIGN KEY(res_id) REFERENCES restaurant(restaurant_id) ON DELETE CASCADE
);


--user's characteristics table
USE purrito;
CREATE TABLE character_user
(
    user_id INT ,
    trait VARCHAR(50),
    PRIMARY KEY(user_id,trait),
    FOREIGN KEY(user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

--food characteristics 

USE purrito;
CREATE TABLE food_characteristic
(
    res_id INT,
    food_id INT ,
    trait VARCHAR(50),
    PRIMARY KEY(res_id,food_id,trait),
    FOREIGN KEY(res_id) REFERENCES restaurant(restaurant_id) ON DELETE CASCADE,
    FOREIGN KEY(food_id) REFERENCES Restaurant_Menu(food_id) ON DELETE CASCADE
);

--order table between restaurant and user
USE purrito;
CREATE TABLE order_res_user
(
    order_id INT AUTO_INCREMENT,
    user_id INT,
    res_id INT ,
    price DECIMAL(7,2),
    PRIMARY KEY(order_id),
    FOREIGN KEY(user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY(res_id) REFERENCES restaurant(restaurant_id) ON DELETE CASCADE
);


--order and menu item table
USE purrito;
CREATE TABLE Order_item
(
    order_id INT,
    food_id INT,
    quantity INT,
    PRIMARY KEY(order_id,food_id),
    FOREIGN KEY(order_id) REFERENCES order_res_user(order_id) ON DELETE CASCADE,
    FOREIGN KEY(food_id) REFERENCES Restaurant_Menu(food_id) ON DELETE CASCADE

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
    FOREIGN KEY(user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY(res_id) REFERENCES restaurant(restaurant_id) ON DELETE CASCADE,
    FOREIGN KEY(order_id) REFERENCES order_res_user(order_id) ON DELETE CASCADE
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
    FOREIGN KEY(order_id) REFERENCES order_res_user(order_id) ON DELETE CASCADE,
    FOREIGN KEY(driver_id)REFERENCES driver(driver_id) ON DELETE SET NULL
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
    FOREIGN KEY(order_id) REFERENCES order_res_user(order_id) ON DELETE CASCADE,
    FOREIGN KEY(driver_id)REFERENCES driver(driver_id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES user(user_id) ON DELETE SET NULL
);

--table for restaurants to host their leftovers

USE purrito;
CREATE TABLE leftover_available
(
    res_id INT,
    food_id INT,
    made_on DATE ,
    PRIMARY KEY(res_id,food_id,made_on),
    FOREIGN KEY(res_id) REFERENCES restaurant(restaurant_id) ON DELETE CASCADE,
    FOREIGN KEY(food_id) REFERENCES Restaurant_Menu(food_id) ON DELETE CASCADE
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
    FOREIGN KEY(res_id) REFERENCES restaurant(restaurant_id) ON DELETE CASCADE,
    FOREIGN KEY(food_id) REFERENCES Restaurant_Menu(food_id)ON DELETE CASCADE,
    FOREIGN KEY(org_id) REFERENCES organization(org_id) ON DELETE CASCADE
);


USE purrito;
ALTER TABLE order_res_user
ADD payment_method VARCHAR(20)


USE purrito;
CREATE TABLE payment_credentials
(
    user_id INT,
    payment_method VARCHAR(30),
    payment_method_information VARCHAR(100),
    PRIMARY KEY(user_id,payment_method),
    FOREIGN KEY(user_id) REFERENCES user(user_id) ON DELETE CASCADE
)




















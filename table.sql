--create a database for project
CREATE DATABASE purrito;


--Uses purrtio db for storage
USE purrito;
SELECT *
FROM user;


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
    lat DECIMAL(10,8),
    lng DECIMAL(11,8),
    food_program BOOLEAN DEFAULT 0,
    res_image_path VARCHAR(512),
    description VARCHAR(100),
    restaurant_type VARCHAR(50),
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
    join_date DATE,
    PRIMARY KEY(driver_id)
);

--restaurant income table

USE purrito;
CREATE TABLE restaurant_income
(
    order_id INT,
    restaurant_id INT,
    payment DECIMAL(7,2),
    payment_date DATE,
    has_delivered BOOLEAN DEFAULT 0,
    PRIMARY KEY(order_id,restaurant_id),
    FOREIGN KEY(order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY(restaurant_id) REFERENCES restaurant(restaurant_id) ON DELETE CASCADE
);

--driver income table
USE purrito;
CREATE TABLE driver_income (
    order_id INT,
    driver_id INT,
    payment DECIMAL(7,2),
    payment_date DATE,
    has_delivered BOOLEAN DEFAULT FALSE,
    PRIMARY KEY(order_id, driver_id),
    FOREIGN KEY(order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY(driver_id) REFERENCES driver(driver_id) ON DELETE CASCADE
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
    PRIMARY KEY(phone_number),
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
    quantity_sold INT DEFAULT 0,
    food_image_path VARCHAR(512),
    PRIMARY KEY(food_id),
    FOREIGN KEY(res_id) REFERENCES restaurant(restaurant_id) ON DELETE CASCADE
);

--Add discount_percent column to Restaurant_Menu
ALTER TABLE Restaurant_Menu 
ADD COLUMN discount_percent DECIMAL(5,2) DEFAULT 0;


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
CREATE TABLE orders(
  order_id INT AUTO_INCREMENT,
  user_id INT,
  restaurant_id INT,
  driver_id INT,
  price DECIMAL(6,2),
  delivery_address VARCHAR(255),
  delivery_lat DECIMAL(10,8),
  delivery_lng DECIMAL(11,8),
  payment_method VARCHAR(20),
  status ENUM('WAITING','PLACED','PREPARING','PICKED_UP','DELIVERED','REJECTED') DEFAULT 'WAITING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  rejection_reason VARCHAR(255) NULL,
  PRIMARY KEY(order_id),
  FOREIGN KEY(user_id) REFERENCES user(user_id) ON DELETE SET NULL,
  FOREIGN KEY(restaurant_id) REFERENCES restaurant(restaurant_id) ON DELETE SET NULL,
  FOREIGN KEY(driver_id) REFERENCES driver(driver_id) ON DELETE SET NULL
);



--order and menu item table
USE purrito;
CREATE TABLE order_item
(
    order_id INT,
    food_id INT,
    quantity INT,
    PRIMARY KEY(order_id,food_id),
    FOREIGN KEY(order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
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
    comment VARCHAR(100),
    PRIMARY KEY(user_id,res_id,order_id),
    FOREIGN KEY(user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY(res_id) REFERENCES restaurant(restaurant_id) ON DELETE CASCADE,
    FOREIGN KEY(order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

--order table for showing the current status of order
--can have driver column null


--table for rating driver based on an order

USE purrito;
CREATE TABLE rating_driver
(
    order_id INT,
    user_id INT,
    driver_id INT,
    rating INT,
    PRIMARY KEY(order_id),
    FOREIGN KEY(order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
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
    quantity INT,
    taken_on DATE NULL,
    org_id INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(res_id,food_id,made_on),
    FOREIGN KEY(res_id) REFERENCES restaurant(restaurant_id) ON DELETE CASCADE,
    FOREIGN KEY(food_id) REFERENCES Restaurant_Menu(food_id) ON DELETE CASCADE,
    FOREIGN KEY(org_id) REFERENCES organization(org_id) ON DELETE CASCADE   
);

--table for restaurant issued coupons
USE purrito;
CREATE TABLE food_item_coupon
(
    coupon_id INT AUTO_INCREMENT,
    food_id INT,
    coupon_name VARCHAR(100) NOT NULL,
    discount_type ENUM('PERCENT','FIXED') NOT NULL,
    discount_value INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_on DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    times_used INT DEFAULT 0,
    PRIMARY KEY(coupon_id),
    FOREIGN KEY(food_id) REFERENCES Restaurant_Menu(food_id) ON DELETE CASCADE
);



USE purrito;
CREATE TABLE payment_credentials
(
    user_id INT,
    payment_method VARCHAR(30),
    payment_method_information VARCHAR(100),
    PRIMARY KEY(user_id,payment_method),
    FOREIGN KEY(user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

CREATE TABLE coupon (
    coupon_code VARCHAR(20) PRIMARY KEY,
    discount_percent DECIMAL(5,2) NOT NULL,
    min_order_value DECIMAL(7,2) DEFAULT 0,
    expiry_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT 1
);

--Sample coupons for testing
INSERT INTO coupon VALUES ('WELCOME10', 10.00, 100.00, '2026-12-31', 1);
INSERT INTO coupon VALUES ('PURRITO20', 20.00, 200.00, '2026-12-31', 1);
INSERT INTO coupon VALUES ('SAVE50',     5.00,  50.00, '2026-12-31', 1);


USE purrito;
SELECT * FROM restaurant;


USE purrito;
SELECT * FROM user;

USE purrito;
SELECT * FROM driver;


--Triggers required
--1
--trigger for confirmation payment status after delivering the order
DELIMITER $$

CREATE TRIGGER confirm_payment
AFTER UPDATE
ON orders
FOR EACH ROW
BEGIN
    IF OLD.status<>'DELIVERED' AND NEW.status='DELIVERED' THEN
        UPDATE driver_income 
        SET has_delivered=TRUE
        WHERE order_id=NEW.order_id;
        UPDATE restaurant_income 
        SET has_delivered=TRUE
        WHERE order_id=NEW.order_id;
    END IF;
END$$

DELIMITER ;

--2
--event for deleting leftovers which have been sitting for 48 hours with no org taking it
DELIMITER $$

CREATE EVENT delete_old_leftovers
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
    DELETE FROM leftover_available
    WHERE created_at<NOW()-INTERVAL 48 HOUR AND org_id IS NULL;
END $$

DELIMITER ;


--3
DELIMITER $$

CREATE TRIGGER validate_rating_restaurant 
BEFORE INSERT ON rating_restaurant
FOR EACH ROW
BEGIN
    IF NEW.rating<1 OR NEW.rating>5 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Rating must be between 1 and 5';
    END IF;
END $$

DELIMITER ;

--4 
DELIMITER $$

CREATE TRIGGER validate_rating_driver 
BEFORE INSERT ON rating_driver
FOR EACH ROW
BEGIN
    IF NEW.rating<1 OR NEW.rating>5 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Rating must be between 1 and 5';
    END IF;
END $$

DELIMITER ;

--5
DELIMITER $$ 

CREATE TRIGGER prevent_rating_restaurant_undelivered
BEFORE INSERT ON rating_restaurant
FOR EACH ROW
BEGIN 
    DECLARE ord_status VARCHAR(20);
    SELECT status INTO ord_status FROM orders WHERE order_id= NEW.order_id;
    IF ord_status <> 'DELIVERED' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot rate an undelivered order';
    END IF;
END $$

DELIMITER ;

--6
DELIMITER $$

CREATE TRIGGER prevent_rating_driver_undelivered
BEFORE INSERT ON rating_driver
FOR EACH ROW
BEGIN 
    DECLARE ord_status VARCHAR(20);
    SELECT status INTO ord_status FROM orders WHERE order_id= NEW.order_id;
    IF ord_status <> 'DELIVERED' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot rate driver before the order is delivered.';
    END IF;
END $$

DELIMITER ;




        



















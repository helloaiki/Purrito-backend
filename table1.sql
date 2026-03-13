CREATE DATABASE purrito;
USE purrito;

--User
CREATE TABLE user
(
    user_id INT AUTO_INCREMENT,
    user_name VARCHAR(30)  NOT NULL,
    email_address VARCHAR(60)  UNIQUE,
    password VARCHAR(60),
    phone_number CHAR(11),
    last_lat DECIMAL(10,8) NULL,
    last_lng DECIMAL(11,8) NULL,
    PRIMARY KEY(user_id)
);

-- Restaurant
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
    lat DECIMAL(10,8) NULL,
    lng DECIMAL(11,8) NULL,
    food_program BOOLEAN DEFAULT 0,
    res_image_path VARCHAR(512),
    description VARCHAR(100),
    restaurant_type VARCHAR(50),
    PRIMARY KEY(restaurant_id)
);

-- Driver
CREATE TABLE driver
(
    driver_id INT AUTO_INCREMENT,
    user_name VARCHAR(30) NOT NULL,
    email_address VARCHAR(60) UNIQUE,
    password VARCHAR(60),
    verification_method VARCHAR(100),
    phone_number CHAR(11),
    join_date DATE,
    lat DECIMAL(10,8) NULL,
    lng DECIMAL(11,8) NULL,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(driver_id)
);

-- Organization
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
    lat DECIMAL(10,8) NULL,
    lng DECIMAL(11,8) NULL,
    PRIMARY KEY(org_id)
);

-- Restaurant Contact
CREATE TABLE contact_restaurant
(
    res_id INT,
    phone_number CHAR(11),
    PRIMARY KEY(phone_number),
    FOREIGN KEY(res_id) REFERENCES restaurant(restaurant_id) ON DELETE CASCADE
);

-- Menu Table
--change made - Discount doesnt make sense here in the menu table
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

-- User's characteristic table
CREATE TABLE character_user
(
    user_id INT,
    trait VARCHAR(50),
    PRIMARY KEY(user_id, trait),
    FOREIGN KEY(user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- Food characteristics
CREATE TABLE food_characteristic
(
    res_id INT,
    food_id INT,
    trait VARCHAR(50),
    PRIMARY KEY(res_id, food_id, trait),
    FOREIGN KEY(res_id) REFERENCES restaurant(restaurant_id) ON DELETE CASCADE,
    FOREIGN KEY(food_id) REFERENCES Restaurant_Menu(food_id) ON DELETE CASCADE
);

-- Order table between restaurant and user
CREATE TABLE orders
(
    order_id INT AUTO_INCREMENT,
    user_id INT,
    restaurant_id INT,
    driver_id INT,
    price DECIMAL(6,2),
    delivery_address VARCHAR(255),
    delivery_lat DECIMAL(10,8),
    delivery_lng DECIMAL(11,8),
    payment_method VARCHAR(20),
    delivery_fee DECIMAL(6,2) DEFAULT 50.00,
    search_start_time TIMESTAMP NULL,
    is_pickup_offered BOOLEAN DEFAULT FALSE,
    search_radius_km DECIMAL(4,2) DEFAULT 5.0,
    status ENUM('WAITING','PLACED','PREPARING','PICKED_UP','DELIVERED','REJECTED') DEFAULT 'WAITING',
    rejection_reason  VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(order_id),
    FOREIGN KEY(user_id) REFERENCES user(user_id) ON DELETE SET NULL,
    FOREIGN KEY(restaurant_id) REFERENCES restaurant(restaurant_id) ON DELETE SET NULL,
    FOREIGN KEY(driver_id) REFERENCES driver(driver_id) ON DELETE SET NULL
);

-- Ordered items table
CREATE TABLE order_item
(
    order_id INT,
    food_id INT,
    quantity INT,
    PRIMARY KEY(order_id, food_id),
    FOREIGN KEY(order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY(food_id)  REFERENCES Restaurant_Menu(food_id) ON DELETE CASCADE
);

-- Restaurant income table
CREATE TABLE restaurant_income
(
    order_id INT,
    restaurant_id INT,
    payment DECIMAL(7,2),
    payment_date DATE,
    has_delivered BOOLEAN DEFAULT 0,
    PRIMARY KEY(order_id, restaurant_id),
    FOREIGN KEY(order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY(restaurant_id) REFERENCES restaurant(restaurant_id) ON DELETE CASCADE
);

-- Driver income table
CREATE TABLE driver_income
(
    order_id INT,
    driver_id INT,
    payment DECIMAL(7,2),
    payment_date DATE,
    has_delivered BOOLEAN DEFAULT FALSE,
    PRIMARY KEY(order_id, driver_id),
    FOREIGN KEY(order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY(driver_id) REFERENCES driver(driver_id) ON DELETE CASCADE
);

-- Rating for restaurant for particular order
CREATE TABLE rating_restaurant
(
    user_id INT,
    res_id INT,
    order_id INT,
    rating INT,
    comment VARCHAR(100),
    PRIMARY KEY(user_id, res_id, order_id),
    FOREIGN KEY(user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY(res_id) REFERENCES restaurant(restaurant_id) ON DELETE CASCADE,
    FOREIGN KEY(order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- Rating for driver
CREATE TABLE rating_driver
(
    order_id INT,
    user_id INT,
    driver_id INT,
    rating INT,
    PRIMARY KEY(order_id),
    FOREIGN KEY(order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY(driver_id) REFERENCES driver(driver_id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES user(user_id) ON DELETE SET NULL
);

-- Table for restaurants to host their leftovers
CREATE TABLE leftover_available
(
    res_id INT,
    food_id INT,
    made_on DATE,
    quantity INT,
    taken_on DATE NULL,
    org_id INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(res_id, food_id, made_on),
    FOREIGN KEY(res_id) REFERENCES restaurant(restaurant_id) ON DELETE CASCADE,
    FOREIGN KEY(food_id) REFERENCES Restaurant_Menu(food_id) ON DELETE CASCADE,
    FOREIGN KEY(org_id) REFERENCES organization(org_id) ON DELETE CASCADE
);

--table for restaurant issued coupons
USE purrito;
CREATE TABLE food_item_coupon
(
    coupon_id INT AUTO_INCREMENT,
    restaurant_id INT,
    coupon_name VARCHAR(100) NOT NULL,
    discount_type ENUM('PERCENT','FIXED') NOT NULL,
    discount_value INT NOT NULL,
    times_used INT DEFAULT 0,
    PRIMARY KEY(coupon_id),
    FOREIGN KEY(restaurant_id) REFERENCES restaurant(restaurant_id)
);

--table for actually assigning coupons to food items
USE PURRITO;
CREATE TABLE couponed_items
(
    food_id INT,
    coupon_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_on DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    PRIMARY KEY(food_id,coupon_id),
    FOREIGN KEY(food_id) REFERENCES Restaurant_Menu(food_id) ON DELETE CASCADE,
    FOREIGN KEY(coupon_id) REFERENCES food_item_coupon(coupon_id) ON DELETE CASCADE
);


--Table for coupons given by website
CREATE TABLE coupon (
    coupon_code VARCHAR(20) PRIMARY KEY,
    discount_percent DECIMAL(5,2) NOT NULL,
    min_order_value DECIMAL(7,2) DEFAULT 0,
    expiry_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT 1
);

-- Payment credentials
CREATE TABLE payment_credentials
(
    user_id INT,
    payment_method VARCHAR(30),
    payment_method_information VARCHAR(100),
    PRIMARY KEY(user_id, payment_method),
    FOREIGN KEY(user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- Notification table
CREATE TABLE notifications
(
    notif_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    driver_id INT NULL,
    restaurant_id INT NULL,
    org_id INT NULL,
    role ENUM('user','driver','restaurant','organization') NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY(driver_id) REFERENCES driver(driver_id) ON DELETE CASCADE,
    FOREIGN KEY(restaurant_id) REFERENCES restaurant(restaurant_id) ON DELETE CASCADE,
    FOREIGN KEY(org_id) REFERENCES organization(org_id) ON DELETE CASCADE
);

-- Driver assignment logs table
CREATE TABLE driver_assignment_logs
(
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    driver_id INT,
    status ENUM('PENDING','ACCEPTED','DECLINED','TIMEOUT') DEFAULT 'PENDING',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    FOREIGN KEY(order_id) REFERENCES orders(order_id)  ON DELETE CASCADE,
    FOREIGN KEY(driver_id) REFERENCES driver(driver_id) ON DELETE CASCADE
);

-- Triggers
-- 1. Confirm payment on delivery
DELIMITER $$

CREATE TRIGGER confirm_payment
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF OLD.status <> 'DELIVERED' AND NEW.status = 'DELIVERED' THEN
        UPDATE driver_income SET has_delivered = TRUE WHERE order_id = NEW.order_id;
        UPDATE restaurant_income SET has_delivered = TRUE WHERE order_id = NEW.order_id;
    END IF;
END$$

DELIMITER ;

-- 2. Validate restaurant rating (1–5)
DELIMITER $$

CREATE TRIGGER validate_rating_restaurant
BEFORE INSERT ON rating_restaurant
FOR EACH ROW
BEGIN
    IF NEW.rating < 1 OR NEW.rating > 5 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Rating must be between 1 and 5';
    END IF;
END$$

DELIMITER ;

-- 3. Validate driver rating (1–5)
DELIMITER $$

CREATE TRIGGER validate_rating_driver
BEFORE INSERT ON rating_driver
FOR EACH ROW
BEGIN
    IF NEW.rating < 1 OR NEW.rating > 5 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Rating must be between 1 and 5';
    END IF;
END$$

DELIMITER ;

-- 4. Prevent rating a restaurant before delivery
DELIMITER $$

CREATE TRIGGER prevent_rating_restaurant_undelivered
BEFORE INSERT ON rating_restaurant
FOR EACH ROW
BEGIN
    DECLARE ord_status VARCHAR(20);
    SELECT status INTO ord_status FROM orders WHERE order_id = NEW.order_id;
    IF ord_status <> 'DELIVERED' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot rate an undelivered order';
    END IF;
END$$

DELIMITER ;

-- 5. Prevent rating a driver before delivery
DELIMITER $$

CREATE TRIGGER prevent_rating_driver_undelivered
BEFORE INSERT ON rating_driver
FOR EACH ROW
BEGIN
    DECLARE ord_status VARCHAR(20);
    SELECT status INTO ord_status FROM orders WHERE order_id = NEW.order_id;
    IF ord_status <> 'DELIVERED' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot rate driver before the order is delivered.';
    END IF;
END$$

DELIMITER ;

-- Events
-- Event for deleting leftovers which have been sitting for 48 hours with no org taking it
DELIMITER $$

CREATE EVENT delete_old_leftovers
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
    DELETE FROM leftover_available
    WHERE created_at < NOW() - INTERVAL 48 HOUR AND org_id IS NULL;
END$$

DELIMITER ;

--event for deactivating all coupons beyond their expiry date
DELIMITER $$

CREATE EVENT deactivate_coupon
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
    UPDATE couponed_items
    SET is_active=FALSE
    WHERE expires_on<=NOW() AND is_active=TRUE;
END $$

DELIMITER ;

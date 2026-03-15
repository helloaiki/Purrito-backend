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

-- 6. Log to notifications table when a driver is assigned to an order
DELIMITER $$

CREATE TRIGGER log_driver_assignment
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF OLD.driver_id IS NULL AND NEW.driver_id IS NOT NULL THEN
        INSERT INTO notifications (driver_id, role, title, message, type) VALUES (NEW.driver_id, 'driver', 'Order Assigned', CONCAT('You have been assiged to order #',NEW.order_id,'.'), 'DRIVER_ASSIGNED');
    END IF;
END$$;

DELIMITER ;

-- Events
-- 1. Event for deleting leftovers which have been sitting for 48 hours with no org taking it
DELIMITER $$

CREATE EVENT delete_old_leftovers
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
    DELETE FROM leftover_available
    WHERE created_at < NOW() - INTERVAL 48 HOUR AND org_id IS NULL;
END$$

DELIMITER ;

-- 2. Event for deactivating all coupons beyond their expiry date
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


-- Functions
-- 1. Returns avg rating of a driver (0.0 if unrated)
DELIMITER $$

CREATE FUNCTION GetDriverAverageRating(p_driver_id INT)
RETURNS DECIMAL(3,1)
DETERMINISTIC
READS SQL DATA
BEGIN 
    DECLARE avg_rating DECIMAL(3,1);
    SELECT ROUND(AVG(rating),1)
    INTO avg_rating
    FROM rating_driver
    WHERE driver_id = p_driver_id;
    RETURN IFNULL(avg_rating,0.0);
END$$

DELIMITER ;

-- 2. Returns avg rating of a restaurant (0.0 if unrated)
DELIMITER $$

CREATE FUNCTION GetRestaurantAverageRating(p_res_id INT)
RETURNS DECIMAL(3,1)
DETERMINISTIC
READS SQL DATA
BEGIN 
    DECLARE avg_rating DECIMAL(3,1);
    SELECT ROUND(AVG(rating),1)
    INTO avg_rating
    FROM rating_restaurant
    WHERE res_id = p_res_id;
    RETURN IFNULL(avg_rating,0.0);
END$$

DELIMITER ;


-- Procedures 
-- 1. Handles full order placement workflow
DELIMITER $$ 

CREATE PROCEDURE placeOrder(
    IN p_user_id INT,
    IN p_restaurant_id INT,
    IN p_price DECIMAL(6,2),
    IN p_delivery_fee DECIMAL(6,2),
    IN p_delivery_address VARCHAR(255),
    IN p_delivery_lat DECIMAL(10,8),
    IN p_delivery_lng DECIMAL(11,8),
    IN p_payment_method VARCHAR(20),
    IN p_items_json JSON,
    OUT p_order_id INT
)
BEGIN
    DECLARE v_idx INT DEFAULT 0;
    DECLARE v_count INT;
    DECLARE v_food_id INT;
    DECLARE v_quantity INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN 
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'PlaceOrder failed - transaction rolled back';
    END;

    START TRANSACTION;

    -- Insert ORDER
    INSERT INTO orders(user_id, restaurant_id, price, delivery_fee, delivery_address, delivery_lat, delivery_lng, payment_method, status)
    VALUES (p_user_id, p_restaurant_id, p_price, p_delivery_fee, p_delivery_address, p_delivery_lat, p_delivery_lng, p_payment_method, 'WAITING');

    SET p_order_id = LAST_INSERT_ID();

    -- Insert ORDER_ITEMS
    SET v_count = JSON_LENGTH(p_items_json);
    WHILE v_idx < v_count DO
        SET v_food_id = JSON_UNQUOTE(JSON_EXTRACT(p_items_json, CONCAT('$[', v_idx, '].food_id')));
        SET v_quantity = JSON_UNQUOTE(JSON_EXTRACT(p_items_json, CONCAT('$[', v_idx, '].quantity')));
        INSERT INTO order_item(order_id, food_id, quantity) VALUES (p_order_id, v_food_id, v_quantity);

        UPDATE Restaurant_Menu
        SET quantity_sold = quantity_sold + v_quantity
        WHERE food_id = v_food_id;

        SET v_idx = v_idx + 1;
    END WHILE;

    -- Create restaurant income record
    INSERT INTO restaurant_income (order_id, restaurant_id, payment, payment_date, has_delivered)
    VALUES (p_order_id, p_restaurant_id, p_price - p_delivery_fee, CURDATE(), FALSE);

    COMMIT;
END$$

DELIMITER ;

-- 2. Handles driver assignment
DELIMITER $$

CREATE PROCEDURE AssignDriverToOrder(
    IN p_order_id INT,
    IN p_driver_id INT,
    IN p_notif_id INT
)
BEGIN 
    DECLARE v_delivery_fee DECIMAL(6,2);
    DECLARE v_affected INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN 
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'AssignDriverToOrder failed - transaction rolled back';
    END;

    START TRANSACTION;
    -- Fetch delivery fee from order
    SELECT delivery_fee INTO v_delivery_fee
    FROM orders
    WHERE order_id = p_order_id;

    -- Assign driver 
    UPDATE orders
    SET driver_id = p_driver_id, status= 'PREPARING'
    WHERE order_id = p_order_id AND driver_id IS NULL;

    -- If another driver grabbed it first, abort
    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Order already assigned to another driver';
    END IF;

    -- Mark the assignment log as ACCEPTED
    UPDATE driver_assignment_logs
    SET status = 'ACCEPTED', responded_at = NOW()
    WHERE order__id = p_order_id AND driver_id = p_driver_id;

    -- Record driver income
    INSERT INTO driver_income (order_id, driver_id, payment, payment_date, has_delivered)
    VALUES (p_order_id, p_driver_id, v_delivery_fee, CURDATE(), FALSE);

    -- Mark notification as read
    IF p_notif_id > 0 THEN
        UPDATE notifications
        SET is_read = TRUE
        WHERE notif_id = p_notif_id;
    END IF;

    COMMIT;
END$$

DELIMITER ;

-- 3. Returns all dashboard stats for a driver in one call
DELIMITER $$

CREATE PROCEDURE GetDriverDashboardStats(IN p_driver_id INT)
BEGIN
    SELECT IFNULL(ROUND(SUM(di.payment),2),0) AS totalRevenue,
    (SELECT COUNT(*) FROM orders WHERE driver_id = p_driver_id AND status = 'DELIVERED') AS totalDeliveries,
    GetDriverAverageRating(p_driver_id) AS rating,
    IFNULL((SELECT ROUND(SUM(payment),2) FROM driver_income
        WHERE driver_id = p_driver_id AND has_delivered = 1 AND DATE(payment_date) = CURDATE()),0) AS todayEarnings
    FROM driver_income di
    WHERE di.driver_id = p_driver_id AND di.has_delivered = 1;
    -- Weekly  history
    SELECT 
        DATE_FORMAT(payment_date, '%a') AS day,
        ROUND(SUM(payment), 2) AS dailyRevenue
    FROM driver_income
    WHERE driver_id = p_driver_id AND has_delivered =1 AND payment_date >= DATE_SUB(CURDTAE(), INTERVAL 6 DAY)
    GROUP BY DATE(payment_date)
    ORDER BY DATE(payment_date) ASC;
END$$

DELIMITER ;

-- Updates for Organization Features
ALTER TABLE organization ADD COLUMN contact_number CHAR(11);
ALTER TABLE organization ADD COLUMN moto VARCHAR(255);
ALTER TABLE organization ADD COLUMN ngo_certificate_url VARCHAR(512);
ALTER TABLE organization ADD COLUMN rep_nid_url VARCHAR(512);

ALTER TABLE leftover_available ADD COLUMN status ENUM('AVAILABLE', 'PENDING', 'ACCEPTED', 'REJECTED', 'COLLECTED') DEFAULT 'AVAILABLE';
ALTER TABLE leftover_available ADD COLUMN pickup_time DATETIME NULL;

CREATE TABLE distributed_food (
    dist_id INT AUTO_INCREMENT PRIMARY KEY,
    org_id INT,
    food_name VARCHAR(100) NOT NULL,
    amount INT NOT NULL,
    claim_no INT NULL,
    restaurant_name VARCHAR(100) NOT NULL,
    distribution_date DATE NOT NULL,
    people_fed INT NOT NULL,
    distribution_area VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(org_id) REFERENCES organization(org_id) ON DELETE CASCADE
);
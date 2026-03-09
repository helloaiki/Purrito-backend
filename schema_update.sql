USE purrito;

-- Add location to driver table
ALTER TABLE driver 
ADD COLUMN lat DECIMAL(10,8) NULL,
ADD COLUMN lng DECIMAL(11,8) NULL,
ADD COLUMN last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

--Add location to restaurant table
ALTER TABLE restaurant
ADD COLUMN lat DECIMAL(10,8) NULL,
ADD COLUMN lng DECIMAL(11,8) NULL;

-- Add last known location to user table
ALTER TABLE user
ADD COLUMN last_lat DECIMAL(10,8) NULL,
ADD COLUMN last_lng DECIMAL(11,8) NULL;

-- Extend orders table for complex fulfillment
ALTER TABLE orders
ADD COLUMN delivery_fee DECIMAL(6,2) DEFAULT 50.00,
ADD COLUMN search_start_time TIMESTAMP NULL,
ADD COLUMN is_pickup_offered BOOLEAN DEFAULT FALSE,
ADD COLUMN search_radius_km DECIMAL(4,2) DEFAULT 5.0;

-- Create notifications table
CREATE TABLE notifications (
    notif_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    driver_id INT NULL,
    restaurant_id INT NULL,
    org_id INT NULL,
    role ENUM('user', 'driver', 'restaurant', 'organization') NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES driver(driver_id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurant(restaurant_id) ON DELETE CASCADE,
    FOREIGN KEY (org_id) REFERENCES organization(org_id) ON DELETE CASCADE
);

-- Create table for tracking driver search attempts (for the 10-minute logic)
CREATE TABLE driver_assignment_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    driver_id INT,
    status ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'TIMEOUT') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES driver(driver_id) ON DELETE CASCADE
);

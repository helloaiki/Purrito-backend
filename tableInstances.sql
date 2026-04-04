SET FOREIGN_KEY_CHECKS = 0;

-- 1. USERS
INSERT IGNORE INTO `user` (user_id, user_name, email_address, password, phone_number, is_verified) VALUES
(1, 'arif_ahmed', 'arif@gmail.com', '$2b$10$hashed', '01711000001', 1),
(2, 'fatima_k', 'fatima@gmail.com', '$2b$10$hashed', '01711000002', 1),
(3, 'sabbir_r', 'sabbir@gmail.com', '$2b$10$hashed', '01711000003', 1),
(4, 'nadia_hossain', 'nadia@gmail.com', '$2b$10$hashed', '01711000004', 1),
(5, 'tanvir_islam', 'tanvir@gmail.com', '$2b$10$hashed', '01711000005', 1),
(6, 'mim_chowdhury', 'mim@gmail.com', '$2b$10$hashed', '01711000006', 1),
(7, 'rakib_hassan', 'rakib@gmail.com', '$2b$10$hashed', '01711000007', 1),
(8, 'sadia_parvin', 'sadia@gmail.com', '$2b$10$hashed', '01711000008', 1),
(9, 'omar_faruk', 'omar@gmail.com', '$2b$10$hashed', '01711000009', 1),
(10, 'lina_begum', 'lina@gmail.com', '$2b$10$hashed', '01711000010', 1),
(11, 'jahid_hasan', 'jahid@gmail.com', '$2b$10$hashed', '01711000011', 1),
(12, 'rifat_alam', 'rifat@gmail.com', '$2b$10$hashed', '01711000012', 1),
(13, 'sumaiya_a', 'sumaiya@gmail.com', '$2b$10$hashed', '01711000013', 1),
(14, 'hasan_m', 'hasan@gmail.com', '$2b$10$hashed', '01711000014', 1),
(15, 'jannat_f', 'jannat@gmail.com', '$2b$10$hashed', '01711000015', 1),
(16, 'maksud_r', 'maksud@gmail.com', '$2b$10$hashed', '01711000016', 1),
(17, 'nila_h', 'nila@gmail.com', '$2b$10$hashed', '01711000017', 1),
(18, 'pavel_s', 'pavel@gmail.com', '$2b$10$hashed', '01711000018', 1),
(19, 'shirin_a', 'shirin@gmail.com', '$2b$10$hashed', '01711000019', 1),
(20, 'babul_m', 'babul@gmail.com', '$2b$10$hashed', '01711000020', 1),
(21, 'kayes_m', 'kayes@gmail.com', '$2b$10$hashed', '01711000021', 1),
(22, 'rachel_z', 'rachel@gmail.com', '$2b$10$hashed', '01711000022', 1),
(23, 'monir_h', 'monir@gmail.com', '$2b$10$hashed', '01711000023', 1),
(24, 'tania_s', 'tania@gmail.com', '$2b$10$hashed', '01711000024', 1);

-- 2. RESTAURANTS
INSERT IGNORE INTO restaurant (restaurant_id, res_name, email_address, password, street, city, postal_code, building_name, food_program, res_image_path, description, restaurant_type) VALUES
(1, 'Spice Garden', 'spicegarden@res.com', '$2b$10$p', 'Road 12, Dhanmondi', 'Dhaka', '1209', 'Spice Tower', 1, 'https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=800', 'Authentic heritage cuisine', 'Bangladeshi'),
(2, 'Burger Barn', 'burgerbarn@res.com', '$2b$10$p', 'Road 27, Banani', 'Dhaka', '1213', 'Barn Plaza', 0, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', 'Juicy grilled burgers', 'Fast Food'),
(3, 'Sushi Sakura', 'sushisakura@res.com', '$2b$10$p', 'Gulshan Ave', 'Dhaka', '1212', 'Sakura Hts', 0, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800', 'Fresh Japanese sushi', 'Japanese'),
(4, 'Pizza Palace', 'pizzapalace@res.com', '$2b$10$p', 'Mirpur Road', 'Dhaka', '1216', 'Palace Bldg', 1, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', 'Wood-fired pizzas', 'Italian'),
(5, 'The Grill Stop', 'grillstop@res.com', '$2b$10$p', 'Motijheel C/A', 'Dhaka', '1000', 'Grill Tower', 0, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800', 'Premium BBQ steaks', 'Steakhouse'),
(6, 'Curry House', 'curryhouse@res.com', '$2b$10$p', 'Uttara Sector 7', 'Dhaka', '1230', 'Curry Cmplx', 1, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800', 'Rich Indian curries', 'Indian'),
(7, 'Noodle Nest', 'noodlenest@res.com', '$2b$10$p', 'Bashundhara R/A', 'Dhaka', '1229', 'Nest Plaza', 0, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800', 'Pan-Asian noodles', 'Chinese'),
(8, 'Green Bowl', 'greenbowl@res.com', '$2b$10$p', 'Lalmatia Block B', 'Dhaka', '1207', 'Green House', 1, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800', 'Healthy vegan salads', 'Healthy'),
(9, 'Kebab Kingdom', 'kebabkingdom@res.com', '$2b$10$p', 'Chowk Bazar', 'Dhaka', '1100', 'Kingdom Twr', 1, 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800', 'Traditional kebabs', 'Middle Eastern'),
(10, 'Tacos & Co', 'tacos@res.com', '$2b$10$p', 'Baridhara', 'Dhaka', '1212', 'Taco Hub', 0, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800', 'Mexican street food', 'Mexican'),
(11, 'Dim Sum Delight', 'dimsum@res.com', '$2b$10$p', 'Mohakhali DOHS', 'Dhaka', '1206', 'Delight Ctr', 0, 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800', 'Handcrafted dim sum', 'Chinese'),
(12, 'Shawarma St', 'shawarma@res.com', '$2b$10$p', 'Elephant Road', 'Dhaka', '1205', 'Street Plaza', 1, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800', 'Best Shawarma in town', 'Middle Eastern'),
(13, 'The Pasta Bar', 'pasta@res.com', '$2b$10$p', 'Gulshan 2', 'Dhaka', '1212', 'Pasta Hts', 0, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800', 'Fresh homemade pasta', 'Italian'),
(14, 'Steak Freak', 'steak@res.com', '$2b$10$p', 'Dhanmondi 27', 'Dhaka', '1209', 'Freak House', 1, 'https://images.unsplash.com/photo-1546241072-48010ad28c2c?w=800', 'Legendary T-bones', 'Steakhouse'),
(15, 'Waffle World', 'waffle@res.com', '$2b$10$p', 'Khilgaon', 'Dhaka', '1219', 'Waffle Twr', 0, 'https://images.unsplash.com/photo-1562329265-95a6d7a63440?w=800', 'Sweet & Savory waffles', 'Dessert'),
(16, 'Seafood Shack', 'seafood@res.com', '$2b$10$p', 'Uttara Sector 3', 'Dhaka', '1230', 'Shack Bldg', 1, 'https://images.unsplash.com/photo-1534080355125-27abc49a0397?w=800', 'Fresh coastal catch', 'Seafood'),
(17, 'Thai Terrace', 'thai@res.com', '$2b$10$p', 'Dhanmondi 15', 'Dhaka', '1209', 'Thai Plaza', 0, 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800', 'Authentic Thai flavors', 'Thai'),
(18, 'Bakery Bloom', 'bloom@res.com', '$2b$10$p', 'Banani 11', 'Dhaka', '1213', 'Bloom Tower', 0, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800', 'Freshly baked pastries', 'Bakery'),
(19, 'Mughal Dine', 'mughal@res.com', '$2b$10$p', 'Baily Road', 'Dhaka', '1217', 'Dine Palace', 1, 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800', 'Royal Mughal feast', 'Bangladeshi'),
(20, 'Cafe Cloud', 'cafe@res.com', '$2b$10$p', 'Bashundhara', 'Dhaka', '1229', 'Cloud Hub', 0, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800', 'Artisan coffee & snacks', 'Cafe');

-- 3. DRIVERS
INSERT IGNORE INTO driver (driver_id, user_name, email_address, password, verification_method, phone_number, join_date, lat, lng) VALUES
(1, 'driver_karim', 'karim@dr.com', '$2b$10$p', 'NID', '01811000001', '2024-01-01', 23.7465, 90.3744),
(2, 'driver_rahim', 'rahim@dr.com', '$2b$10$p', 'NID', '01811000002', '2024-02-01', 23.7934, 90.4031),
(3, 'driver_selim', 'selim@dr.com', '$2b$10$p', 'Driving License', '01811000003', '2024-03-01', 23.7806, 90.4129),
(4, 'driver_nasir', 'nasir@dr.com', '$2b$10$p', 'NID', '01811000004', '2024-04-01', 23.8075, 90.3658),
(5, 'driver_kabir', 'kabir@dr.com', '$2b$10$p', 'Passport', '01811000005', '2024-05-01', 23.8723, 90.3987),
(6, 'driver_halim', 'halim@dr.com', '$2b$10$p', 'NID', '01811000006', '2024-06-01', 23.7562, 90.3691),
(7, 'driver_yusuf', 'yusuf@dr.com', '$2b$10$p', 'NID', '01811000007', '2024-07-01', 23.7284, 90.4178),
(8, 'driver_amir', 'amir@dr.com', '$2b$10$p', 'Driving License', '01811000008', '2024-08-01', 23.8168, 90.4255);

-- 4. ORGANIZATIONS
INSERT IGNORE INTO organization (org_id, org_name, email_address, password, street, city, postal_code, building_name, contact_number, moto, ngo_certificate_url) VALUES
(1, 'Feed the Future', 'ftf@org.com', '$2b$10$p', 'Mohammadpur', 'Dhaka', '1207', 'Future House', '01911000001', 'Fighting hunger with hope.', 'https://purrito.com/cert1.pdf'),
(2, 'Hunger Relief BD', 'hrbd@org.com', '$2b$10$p', 'Kamlapur', 'Dhaka', '1214', 'Relief Center', '01911000002', 'Serving the underprivileged.', 'https://purrito.com/cert2.pdf'),
(3, 'Care and Share', 'care@org.com', '$2b$10$p', 'Azimpur', 'Dhaka', '1205', 'Care Complex', '01911000003', 'Caring for those in need.', 'https://purrito.com/cert3.pdf'),
(4, 'Asha Foundation', 'asha@org.com', '$2b$10$p', 'Wari', 'Dhaka', '1203', 'Asha Tower', '01911000004', 'A beacon of hope.', 'https://purrito.com/cert4.pdf'),
(5, 'Nourish BD', 'nourish@org.com', '$2b$10$p', 'Shyamoli', 'Dhaka', '1207', 'Nourish Hub', '01911000005', 'Zero waste, zero hunger.', 'https://purrito.com/cert5.pdf'),
(6, 'Food First', 'food@org.com', '$2b$10$p', 'Pallabi', 'Dhaka', '1216', 'First Tower', '01911000006', 'First in food relief.', 'https://purrito.com/cert6.pdf');

-- 5. MENU ITEMS (Base)
INSERT IGNORE INTO Restaurant_Menu (res_id, name, course_name, price, is_available, quantity_sold, food_image_path) VALUES
(1,'Kacchi Biriyani','Rice',450,1,500,'https://media.istockphoto.com/id/2164869598/photo/kacchi-biryani-bronze-dish.webp?a=1&b=1&s=612x612&w=0&k=20&c=D0Coh1s0BVskofka7p1TujcILe1V6FRnKY6vE9l5zpc='),(1,'Beef Rezala','Rice',380,1,220,'https://images.unsplash.com/photo-1585937421612-70a008356fbe'),(1,'Chicken Roast','Chicken',150,1,400,'https://images.unsplash.com/photo-1598103442097-8b74394b95c6'),(1,'Borhani','Drinks',60,1,800,'https://images.unsplash.com/photo-1583525999977-2b928def9ab6?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Z3JlZW4lMjBkcmlua3xlbnwwfHwwfHx8MA%3D%3D'),(1,'Jorda','Dessert',100,1,300,'https://media.istockphoto.com/id/1158440121/photo/zarda-rice-or-meethe-chawal.webp?a=1&b=1&s=612x612&w=0&k=20&c=z9eGR-4VIlHi3gfogQnPder1qnPQk1KNuy6qCJWHWLI='),(1,'Salad Platter','Salad',50,1,150,'https://images.unsplash.com/photo-1512621776951-a57141f2eefd'),
(2,'Cheese Burger','Burger',320,1,600,'https://images.unsplash.com/photo-1713330801172-03f8d1c0dde7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y2hlZXNlYnVyZ2VyfGVufDB8fDB8fHww'),(2,'Double BBQ Burger','Burger',480,1,400,'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZG91YmxlJTIwYmJxJTIwYnVyZ2VyfGVufDB8fDB8fHww'),(2,'Peri Peri Chicken','Chicken',450,1,500,'https://images.unsplash.com/photo-1532550907401-a500c9a57435'),(2,'Oreo Shake','Drinks',280,1,700,'https://images.unsplash.com/photo-1572490122747-3968b75cc699'),(2,'Garden Salad','Salad',150,1,200,'https://plus.unsplash.com/premium_photo-1676047258557-de72954cf17c?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c2FsYWR8ZW58MHx8MHx8fDA%3D'),(2,'Chocolate Cake','Dessert',250,1,300,'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hvY29sYXRlJTIwY2FrZXxlbnwwfHwwfHx8MA%3D%3D'),
(3,'Salmon Nigiri','Rice',550,1,120,'https://images.unsplash.com/photo-1680675228874-9b9963812b7c?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2FsbW9uJTIwbmlnaXJpfGVufDB8fDB8fHww'),(3,'California Roll','Rice',480,1,300,'https://images.unsplash.com/photo-1559410545-0bdcd187e0a6'),(3,'Spicy Ramen','Rice',520,1,450,'https://plus.unsplash.com/premium_photo-1694547926001-f2151e4a476b?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmFtZW58ZW58MHx8MHx8fDA%3D'),(3,'Miso Soup','Drinks',120,1,200,'https://images.unsplash.com/photo-1547592166-23ac45744acd'),(3,'Matcha Lattee','Drinks',220,1,100,'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWF0Y2hhJTIwbGF0dGV8ZW58MHx8MHx8fDA%3D'),(3,'Sweet Ginger','Dessert',100,1,50,'https://plus.unsplash.com/premium_photo-1725878602905-08409bc87666?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c3dlZXQlMjBnaW5nZXJ8ZW58MHx8MHx8fDA%3D'),
(4,'Pepperoni Pizza','Pizza',580,1,400,'https://images.unsplash.com/photo-1513104890138-7c749659a591'),(4,'Veggie Delight','Pizza',520,1,200,'https://images.unsplash.com/photo-1617470702892-e01504297e84?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dmVnZ2llJTIwcGl6emF8ZW58MHx8MHx8fDA%3D'),(4,'Chicken Pizza','Pizza',650,1,500,'https://images.unsplash.com/photo-1513104890138-7c749659a591'),(4,'Italian Salad','Salad',250,1,300,'https://images.unsplash.com/photo-1512621776951-a57141f2eefdhttps://images.unsplash.com/photo-1608032077018-c9aad9565d29?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aXRhbGlhbiUyMHNhbGFkfGVufDB8fDB8fHww'),(4,'Lemonade','Drinks',100,1,2000,'https://images.unsplash.com/photo-1629380072258-3d0d04a6f65a?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Zm9vZCUyMGxlbW9uYWRlJTIwcmVzdGF1cmFudCUyMGl0ZW18ZW58MHx8MHx8fDA%3D'),(4,'Tiramisu','Dessert',350,1,400,'https://images.unsplash.com/photo-1568627175730-73d05bd69ca9?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8dGlyYW1pc3V8ZW58MHx8MHx8fDA%3D'),
(5,'Ribeye Steak','Rice',1200,1,300,'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmliZXllJTIwc3RlYWt8ZW58MHx8MHx8fDA%3D'),(5,'Grilled Chicken','Chicken',450,1,500,'https://images.unsplash.com/photo-1633436375795-12b3b339712f?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGdyaWxsZWQlMjBjaGlja2VufGVufDB8fDB8fHww'),(5,'Steak Burger','Burger',650,1,150,'https://images.unsplash.com/photo-1568901346375-23c9450c58cd'),(5,'Iced Tea','Drinks',120,1,600,'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aWNlZCUyMHRlYXxlbnwwfHwwfHx8MA%3D%3D'),(5,'Caesar Salad','Salad',280,1,400,'https://plus.unsplash.com/premium_photo-1700089483464-4f76cc3d360b?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2Flc2FyJTIwc2FsYWR8ZW58MHx8MHx8fDA%3D'),(5,'Apple Pie','Dessert',300,1,100,'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2'),
(6,'Butter Chicken','Chicken',450,1,600,'https://media.istockphoto.com/id/639390540/photo/indian-butter-chicken.webp?a=1&b=1&s=612x612&w=0&k=20&c=xZvd8MXsgpCBN-QyW1PdNMes0K55UMLQgbhnKNF30HE='),(6,'Biriyani Platter','Rice',550,1,300,'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a'),(6,'Naan Burger','Burger',250,1,400,'https://images.unsplash.com/photo-1635010247776-e9c722fabb5e?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bmFhbiUyMGJ1cmdlcnxlbnwwfHwwfHx8MA%3D%3D'),(6,'Mango Lassi','Drinks',120,1,900,'https://images.unsplash.com/photo-1719239948819-0afeced16184?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWFuZ28lMjBsYXNzaXxlbnwwfHwwfHx8MA%3D%3D'),(6,'Indian Salad','Salad',120,1,200,'https://images.unsplash.com/photo-1764837534940-bb0185f68b7f?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGluZGlhbiUyMHNhbGFkfGVufDB8fDB8fHww'),(6,'Gulab Jamun','Dessert',150,1,500,'https://media.istockphoto.com/id/1659939047/photo/lalmohan-or-gulab-jamun.webp?a=1&b=1&s=612x612&w=0&k=20&c=h9mVL-f7yZG5e1sV08Qa5cUK3zP7V-7vu3LxMk21dAQ='),
(7,'Pad Thai','Rice',380,1,220,'https://images.unsplash.com/photo-1645500498403-970672caf43e?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cGFkJTIwdGhhaXxlbnwwfHwwfHx8MA%3D%3D'),(7,'Chicken Noodle','Chicken',320,1,150,'https://images.unsplash.com/photo-1569718212165-3a8278d5f624'),(7,'Noodle Burger','Burger',280,1,100,'https://images.unsplash.com/photo-1557723434-b7376b3cec47?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fG5vb2RsZSUyMGJ1cmdlcnxlbnwwfHwwfHx8MA%3D%3D'),(7,'Thai Tea','Drinks',150,1,500,'https://images.unsplash.com/photo-1644031995386-fe9665dc5b57?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGhhaSUyMHRlYXxlbnwwfHwwfHx8MA%3D%3D'),(7,'Som Tum','Salad',180,1,200,'https://media.istockphoto.com/id/2215696464/photo/thai-food.webp?a=1&b=1&s=612x612&w=0&k=20&c=RWk7Gyl9mtAFESOBcDKlE9v5oCQyYAtez8MxtGMsGTE='),(7,'Mango Rice','Dessert',250,1,100,'https://images.unsplash.com/photo-1711161988375-da7eff032e45?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFuZ28lMjByaWNlfGVufDB8fDB8fHww'),
(8,'Quinoa Salad','Salad',450,1,150,'https://plus.unsplash.com/premium_photo-1704989937441-68b6536e6cf4?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cXVpbm9hJTIwc2FsYWR8ZW58MHx8MHx8fDA%3D'),(8,'Vegan Burger','Burger',420,1,200,'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmVnYW4lMjBidXJnZXJ8ZW58MHx8MHx8fDA%3D'),(8,'Brown Rice Bowl','Rice',350,1,300,'https://media.istockphoto.com/id/506583996/photo/grilled-chicken-with-quinoa-and-brown-rice-salad.webp?a=1&b=1&s=612x612&w=0&k=20&c=7NsORsVjR3d9h33LcE2DkfnxKtJlu-Xj77BeWp73LoY='),(8,'Smoothie','Drinks',280,1,400,'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8c21vb3RoaWV8ZW58MHx8MHx8fDA%3D'),(8,'Steam Chicken','Chicken',400,1,100,'https://images.unsplash.com/photo-1741241857345-3dfc8fc1d7db?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8c3RlYW0lMjBjaGlja2VufGVufDB8fDB8fHww'),(8,'Fruit Cup','Dessert',150,1,600,'https://media.istockphoto.com/id/180745827/photo/fresh-fruit-salad-to-go-with-copy-space.webp?a=1&b=1&s=612x612&w=0&k=20&c=dOIq9kpflhdr-Vk8CS_X5r_Haln027xfQu9PXE1ZMiQ='),
(9,'Assorted Kebab','Chicken',800,1,500,'https://images.unsplash.com/photo-1771285119408-04cca3b35036?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGFzb3J0ZWQlMjBrZWJhYnxlbnwwfHwwfHx8MA%3D%3D'),(9,'Kebab Platter','Rice',1200,1,200,'https://images.unsplash.com/photo-1771285119318-b342c3ecc51c?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGtlYmFiJTIwcGxhdHRlcnxlbnwwfHwwfHx8MA%3D%3D'),(9,'Seekh Burger','Burger',350,1,300,'https://images.unsplash.com/photo-1568901346375-23c9450c58cd'),(9,'Mint Lassi','Drinks',100,1,600,'https://media.istockphoto.com/id/1147734167/photo/spiced-buttermilk-indian-traditional-summer-drink.webp?a=1&b=1&s=612x612&w=0&k=20&c=7TUgtuEWjxcL42nUbkGfwQoszD1WTDKSqbXPK4fg5Z4='),(9,'Kebab Salad','Salad',200,1,400,'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGtlYmFiJTIwc2FsYWR8ZW58MHx8MHx8fDA%3D'),(9,'Baklava','Dessert',350,1,200,'https://images.unsplash.com/photo-1617806501553-d3a6a3a7b227?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmFrbGF2YXxlbnwwfHwwfHx8MA%3D%3D'),
(10,'Beef Tacos','Rice',520,1,450,'https://images.unsplash.com/photo-1565299585323-38d6b0865b47'),(10,'Taco Burger','Burger',380,1,200,'https://plus.unsplash.com/premium_photo-1683121324022-d039da524194?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8dGFjbyUyMGJ1cmdlcnxlbnwwfHwwfHx8MA%3D%3D'),(10,'Spicy Chicken Taco','Chicken',450,1,300,'https://images.unsplash.com/photo-1660180750968-4fbc84789a96?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3BpY3klMjBjaGlja2VuJTIwdGFjY298ZW58MHx8MHx8fDA%3D'),(10,'Margarita','Drinks',450,1,200,'https://images.unsplash.com/photo-1632987790465-2634b43c4289?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fG1hcmdhcml0YXxlbnwwfHwwfHx8MA%3D%3D'),(10,'Mexican Salad','Salad',180,1,300,'https://images.unsplash.com/photo-1512621776951-a57141f2eefd'),(10,'Churros','Dessert',220,1,400,'https://plus.unsplash.com/premium_photo-1713687789756-b38c7870eef6?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2h1cnJvc3xlbnwwfHwwfHx8MA%3D%3D'),
(11,'Shrimp Dim Sum','Rice',380,1,400,'https://images.unsplash.com/photo-1563245372-f21724e3856d'),(11,'Chicken Siu Mai','Chicken',350,1,300,'https://plus.unsplash.com/premium_photo-1674601033631-79eeffaac6f9?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2hpY2tlbiUyMHN1aSUyMG1haXxlbnwwfHwwfHx8MA%3D%3D'),(11,'Bao Burger','Burger',450,1,250,'https://media.istockphoto.com/id/2227997359/photo/vegan-bao-bun.webp?a=1&b=1&s=612x612&w=0&k=20&c=8U0cZe3m6kstRIGLUPeyaU404Uzy1Z6SnIC7vCL_rs8='),(11,'Iced Jasmine Tea','Drinks',150,1,900,'https://media.istockphoto.com/id/460550307/photo/cold-red-cocktail-drink-with-lime-slice-and-mint.webp?a=1&b=1&s=612x612&w=0&k=20&c=REqb8Pf1gKy32JrRByrWjC87qWy2qPbU3X9EzBplPBM='),(11,'Chinese Salad','Salad',180,1,200,'https://images.unsplash.com/photo-1608032075690-8922315d6fc2?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2hpbmVzZSUyMHNhbGFkfGVufDB8fDB8fHww'),(11,'Mooncake','Dessert',250,1,100,'https://plus.unsplash.com/premium_photo-1664474816376-408f8ba74be2?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bW9vbmNha2V8ZW58MHx8MHx8fDA%3D'),
(12,'Chicken Shawarma','Burger',180,1,2000,'https://images.unsplash.com/photo-1773620494884-940e0db95e46?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGZvb2QlMjBjaGlja2VuJTIwc2h3YXJtYXxlbnwwfHwwfHx8MA%3D%3D'),(12,'Beef Shawarma Platter','Rice',450,1,500,'https://images.unsplash.com/photo-1561651823-34feb02250e4'),(12,'Shawarma Chicken','Chicken',380,1,1500,'https://images.unsplash.com/photo-1734772591537-15ac1b3b3c04?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Zm9vZCUyMHNod2FybWF8ZW58MHx8MHx8fDA%3D'),(12,'Fresh Juice','Drinks',150,1,1000,'https://images.unsplash.com/photo-1658215248706-52550a0b1ef1?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zm9vZCUyMGZyZXNoJTIwanVpY2V8ZW58MHx8MHx8fDA%3D'),(12,'Fattoush','Salad',180,1,600,'https://media.istockphoto.com/id/607896120/photo/traditional-arabic-fattoush-salad-on-a-plate-horizontal-top-view.webp?a=1&b=1&s=612x612&w=0&k=20&c=ZEcF3G2gIUJIhi6CBCeJ5JbsWRp5HecVqD7Ps3sEWSk='),(12,'Kunafa','Dessert',350,1,800,'https://media.istockphoto.com/id/2201053247/photo/turkish-dessert-kunefe-kunafa-kadayif-with-pistachio.webp?a=1&b=1&s=612x612&w=0&k=20&c=1PGks0WfzG6cfJQzaRR1BUDtCTbu2Ao9LkXln5fuBIo='),
(13,'Fettuccine','Rice',480,1,350,'https://images.unsplash.com/photo-1664214649076-7b17006db5b5?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8RmV0dHVjY2luZXxlbnwwfHwwfHx8MA%3D%3D'),(13,'Chicken Pasta','Chicken',520,1,400,'https://images.unsplash.com/photo-1551183053-bf91a1d81141'),(13,'Pasta Burger','Burger',350,1,150,'https://images.unsplash.com/photo-1520073201527-6b044ba2ca9f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmlzaCUyMGJ1cmdlcnxlbnwwfHwwfHx8MA%3D%3D'),(13,'Espresso','Drinks',220,1,500,'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085'),(13,'Pesto Salad','Salad',280,1,300,'https://plus.unsplash.com/premium_photo-1692309186600-03bb12fd3adb?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGVzdG8lMjBzYWxhZHxlbnwwfHwwfHx8MA%3D%3D'),(13,'Gelato','Dessert',250,1,700,'https://media.istockphoto.com/id/2188918514/photo/ice-cream.webp?a=1&b=1&s=612x612&w=0&k=20&c=uhzwARbGZIeAGMPuryMd71XAxRMvskaZm7V9RWuNJ48='),
(14,'Surf and Turf','Rice',1800,1,80,'https://media.istockphoto.com/id/1214978630/photo/char-grilled-ribeye-steak-with-thyme-and-rosemary-with-bacon-wrapped-jumbo-shrimp-or-prawns.webp?a=1&b=1&s=612x612&w=0&k=20&c=wJRvp-PL8arb94Pc2DtVuEfNudefW3JFHn1isQWVmh4='),(14,'Pepper Chicken','Chicken',1100,1,150,'https://images.unsplash.com/photo-1532550907401-a500c9a57435'),(14,'Mega Burger','Burger',850,1,120,'https://media.istockphoto.com/id/961246842/photo/fresh-huge-tasty-burger-french-fries-bacon-on-a-wooden-table-fast-food.webp?a=1&b=1&s=612x612&w=0&k=20&c=PxkHA88pclSIWuFmaxwBh4__uw6wdcU-6Tt6z7nqDC4='),(14,'Red Velvet','Dessert',450,1,100,'https://images.unsplash.com/photo-1688153009623-0d9a3ba1b105?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHJlZCUyMHZlbHZldCUyMGNha2V8ZW58MHx8MHx8fDA%3D'),(14,'Steak Salad','Salad',400,1,200,'https://images.unsplash.com/photo-1512621776951-a57141f2eefd'),(14,'Fine Coffee','Drinks',320,1,300,'https://images.unsplash.com/photo-1760163178873-7644a924519e?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGZpbmUlMjBjb2ZmZWV8ZW58MHx8MHx8fDA%3D'),
(15,'Nutella Waffle','Dessert',320,1,800,'https://images.unsplash.com/photo-1737700088850-d0b53f9d39ec?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fE51dGVsbGElMjBXYWZmbGV8ZW58MHx8MHx8fDA%3D'),(15,'Waffle Burger','Burger',450,1,350,'https://media.istockphoto.com/id/1135547564/photo/waffle-sandwich-with-meat-cheese-sauce-and-vegetables-on-wooden-table-background.webp?a=1&b=1&s=612x612&w=0&k=20&c=9UjymesApx2okhApubivYz2L99QieQcWj9zH38PbLwQ='),(15,'Waffle Chicken','Chicken',500,1,400,'https://plus.unsplash.com/premium_photo-1664472730118-bec9632ce8f1?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8d2FmZmxlJTIwY2hpY2tlbnxlbnwwfHwwfHx8MA%3D%3D'),(15,'Waffle Rice','Rice',400,1,100,'https://media.istockphoto.com/id/2249575716/photo/corn-waffles-and-cottage-cheese.webp?a=1&b=1&s=612x612&w=0&k=20&c=202gdnR7LrE17FPM2aBl23Ilssz9UCyPN7QHW6zrs1E='),(15,'Hot Coco','Drinks',180,1,500,'https://images.unsplash.com/photo-1640555051787-7d2a30e43863?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGhvdCUyMGNob2NvfGVufDB8fDB8fHww'),(15,'Waffle Salad','Salad',200,1,50,'https://plus.unsplash.com/premium_photo-1674086000918-d5d2ca53ae79?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8d2FmZmxlJTIwc2FsYWR8ZW58MHx8MHx8fDA%3D'),
(16,'Grilled Prawns','Rice',1200,1,200,'https://images.unsplash.com/photo-1688084468401-4938b073aef2?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Z3JpbGxlZCUyMHByYXdufGVufDB8fDB8fHww'),(16,'Prawn Burger','Burger',550,1,300,'https://images.unsplash.com/photo-1644902617089-c40d0345c878?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJhd24lMjBidXJnZXJ8ZW58MHx8MHx8fDA%3D'),(16,'Spicy Calamari','Chicken',450,1,400,'https://images.unsplash.com/photo-1603133872575-9989ab68d24c?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8c3BpY3klMjBjYWxhbWFyaXxlbnwwfHwwfHx8MA%3D%3D'),(16,'Sea Salad','Salad',350,1,250,'https://images.unsplash.com/photo-1703849062114-1b08bb62b150?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8c2VhJTIwc2FsYWR8ZW58MHx8MHx8fDA%3D'),(16,'Lemon Soda','Drinks',150,1,800,'https://images.unsplash.com/photo-1695490454828-f8df9109da43?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bGVtb24lMjBzb2RhfGVufDB8fDB8fHww'),(16,'Creme Brulee','Dessert',450,1,100,'https://images.unsplash.com/photo-1676300184943-09b2a08319a3?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y3JlYW0lMjBicnVsZWV8ZW58MHx8MHx8fDA%3D'),
(17,'Thai Basil Rice','Rice',420,1,250,'https://images.unsplash.com/photo-1707056924976-6b524806dbc9?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8dGhhaSUyMGJhc2lsJTIwcmljZXxlbnwwfHwwfHx8MA%3D%3D'),(17,'Thai Burger','Burger',350,1,200,'https://images.unsplash.com/photo-1568901346375-23c9450c58cd'),(17,'Spicy Thai Chicken','Chicken',450,1,500,'https://images.unsplash.com/photo-1609611180481-d8fe3e7e256a?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHNwaWN5JTIwdGhhaSUyMGNoaWNrZW58ZW58MHx8MHx8fDA%3D'),(17,'Thai Coffee','Drinks',220,1,600,'https://plus.unsplash.com/premium_photo-1726804881341-bfc9554ad94f?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8VGhhaSUyMGNvZmZlZXxlbnwwfHwwfHx8MA%3D%3D'),(17,'Glass Noodle Salad','Salad',280,1,300,'https://images.unsplash.com/photo-1572109848841-1e684ad03bda?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z2xhc3MlMjBub29kbGUlMjBzYWxhZHxlbnwwfHwwfHx8MA%3D%3D'),(17,'Coconut Jelly','Dessert',150,1,800,'https://images.unsplash.com/photo-1667138798643-58cf3874b8b7?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGNvY29udXQlMjBqZWxseXxlbnwwfHwwfHx8MA%3D%3D'),
(18,'Butter Croissant','Dessert',120,1,2000,'https://images.unsplash.com/photo-1713274789534-5a1c93024964?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGZvb2QlMjBidXR0ZXIlMjBjcm9pc3NhbnR8ZW58MHx8MHx8fDA%3D'),(18,'Cake Burger','Burger',250,1,500,'https://media.istockphoto.com/id/1371431471/photo/beef-cheeseburger-on-black-plate-with-flames-in-background.webp?a=1&b=1&s=612x612&w=0&k=20&c=LKgqdM48LRX0zP_3VzYZH8sb5rAoaSuMqzzpHM0Shl4='),(18,'Chicken Puff','Chicken',150,1,1000,'https://images.unsplash.com/photo-1682263167429-0dbcf2c1e127?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Zm9vZCUyMGNoaWNrZW4lMjBwdWZmfGVufDB8fDB8fHww'),(18,'Blueberry Rice','Rice',300,1,100,'https://images.unsplash.com/photo-1621907015288-18a8f4587efe?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Ymx1ZWJlcnJ5JTIwcmljZXxlbnwwfHwwfHx8MA%3D%3D'),(18,'Cappuccino','Drinks',320,1,1500,'https://images.unsplash.com/photo-1719239949023-5cb67c060d1c?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Zm9vZCUyMGNhcHB1Y2Npbm98ZW58MHx8MHx8fDA%3D'),(18,'Berry Salad','Salad',280,1,600,'https://images.unsplash.com/photo-1631311309788-9a37722d05f6?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVycnklMjBzYWxhZHxlbnwwfHwwfHx8MA%3D%3D'),
(19,'Mutton Kacchi Heritage','Rice',480,1,1200,'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a'),(19,'Keto Burger','Burger',280,1,600,'https://plus.unsplash.com/premium_photo-1712352990095-69809ada6f2a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8a2V0byUyMGJ1cmdlcnxlbnwwfHwwfHx8MA%3D%3D'),(19,'Tikka Chicken','Chicken',320,1,1500,'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Zm9vZCUyMHRpa2thJTIwY2hpY2tlbnxlbnwwfHwwfHx8MA%3D%3D'),(19,'Pista Drink','Drinks',150,1,2000,'https://images.unsplash.com/photo-1692616717087-54ee6f6c7e8f?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Zm9vZCUyMHBpc3RhJTIwZHJpbmt8ZW58MHx8MHx8fDA%3D'),(19,'Yogurt Salad','Salad',100,1,500,'https://images.unsplash.com/photo-1757715375767-35ddb5ca9118?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8eW9ndXJ0JTIwc2FsYWR8ZW58MHx8MHx8fDA%3D'),(19,'Kulfi Deluxe','Dessert',120,1,3000,'https://media.istockphoto.com/id/1206438184/photo/delicious-ice-creams-are-beautifully-decorated-on-a-white-ceramic-plate.webp?a=1&b=1&s=612x612&w=0&k=20&c=5tjSr2AvZfjvSFM-ogblwYOIiy-ggE7jYDQvUIHe5XE='),
(20,'Cloud Coffee','Drinks',350,1,4000,'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085'),(20,'Cloud Burger','Burger',380,1,2500,'https://images.unsplash.com/photo-1568901346375-23c9450c58cd'),(20,'Cloud Chicken Wings','Chicken',350,1,1500,'https://images.unsplash.com/photo-1631897788978-da06ec45adcb?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Zm9vZCUyMGNoaWNrZW4lMjB3aW5nc3xlbnwwfHwwfHx8MA%3D%3D'),(20,'Cloud Rice','Rice',420,1,800,'https://images.unsplash.com/photo-1733414717515-d997dafb7341?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cmljZSUyMGl0ZW18ZW58MHx8MHx8fDA%3D'),(20,'Cloud Salad','Salad',280,1,600,'https://plus.unsplash.com/premium_photo-1673590981774-d9f534e0c617?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c2FsYWR8ZW58MHx8MHx8fDA%3D'),(20,'Cloud Cake','Dessert',320,1,1000,'https://images.unsplash.com/photo-1695052544296-63d0b132c63b?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2xvdWQlMjBjYWtlfGVufDB8fDB8fHww');

-- 6. NORMALIZATION & CATEGORIES
UPDATE Restaurant_Menu SET course_name = 'Rice & Pasta' WHERE course_name IN ('Rice', 'Main Course', 'Pasta');
UPDATE Restaurant_Menu SET course_name = 'Fast Food' WHERE course_name IN ('Burger', 'Pizza');
UPDATE Restaurant_Menu SET course_name = 'Appetizers & Sides' WHERE course_name IN ('Salad', 'Appetizer', 'Snacks', 'Chicken');
UPDATE Restaurant_Menu SET course_name = 'Desserts' WHERE course_name IN ('Dessert');
UPDATE Restaurant_Menu SET course_name = 'Beverages' WHERE course_name IN ('Drinks');

-- 7. MOODS & CHARACTERISTICS
INSERT IGNORE INTO food_characteristic (res_id, food_id, trait) VALUES
(1, 1, 'comfort'), (1, 1, 'special'), (1, 2, 'comfort'), (2, 7, 'quick'), (2, 8, 'comfort'),
(3, 13, 'healthy'), (3, 15, 'spicy'), (4, 19, 'quick'), (4, 19, 'comfort'), (5, 25, 'special'),
(6, 31, 'comfort'), (6, 31, 'spicy'), (7, 37, 'quick'), (8, 43, 'healthy'), (9, 49, 'special'),
(10, 55, 'spicy'), (10, 58, 'sweet'), (11, 61, 'quick'), (12, 67, 'quick'), (13, 73, 'comfort'),
(14, 79, 'special'), (15, 85, 'sweet'), (16, 91, 'special'), (17, 97, 'spicy'), (18, 103, 'sweet'),
(19, 109, 'special'), (19, 109, 'comfort'), (20, 115, 'quick'),
-- Ingredient Tags
(3, 13, 'beef'), (4, 19, 'chicken'), (5, 25, 'beef'), (7, 37, 'fish'), (8, 43, 'vegan'), (10, 55, 'beef'), (16, 91, 'fish'), (17, 97, 'chicken');

-- 8. USER PREFERENCES
INSERT IGNORE INTO character_user (user_id, trait) VALUES
(1, 'spicy'), (1, 'comfort'), (2, 'healthy'), (3, 'quick'), (4, 'special'), (5, 'sweet'),
(6, 'comfort'), (7, 'spicy'), (8, 'healthy'), (9, 'special'), (10, 'quick'), (11, 'sweet');

-- 9. COUPONS (Item-Level)
INSERT IGNORE INTO food_item_coupon (restaurant_id, coupon_name, discount_type, discount_value) VALUES
(1, 'KACCHI10', 'PERCENT', 10), 
(2, 'BURGER50', 'FIXED', 50),
(3, 'SAKURA15', 'PERCENT', 15),
(4, 'PIZZA100', 'FIXED', 100),
(5, 'RIBEYE10', 'PERCENT', 10),
(6, 'BUTTER20', 'PERCENT', 20),
(7, 'PADTHAI50', 'FIXED', 50),
(8, 'HEALTHY15', 'PERCENT', 15),
(9, 'KEBAB10', 'PERCENT', 10),
(10, 'TACO40', 'FIXED', 40),
(11, 'SHRIMP12', 'PERCENT', 12),
(12, 'SHAWARMA30', 'FIXED', 30),
(13, 'PASTA10', 'PERCENT', 10),
(14, 'FREAK15', 'PERCENT', 15),
(15, 'WAFFLE20', 'PERCENT', 20),
(16, 'PRAWN200', 'FIXED', 200),
(17, 'BASIL10', 'PERCENT', 10),
(18, 'BLOOM20', 'FIXED', 20),
(19, 'HERITAGE15', 'PERCENT', 15),
(20, 'CLOUD10', 'PERCENT', 10);

-- 10. COUPON ASSIGNMENTS
INSERT IGNORE INTO couponed_items (food_id, coupon_id, expires_on, is_active) VALUES
(1, 1, '2026-12-31', 1), 
(7, 2, '2026-12-31', 1),
(13, 3, '2026-12-31', 1),
(19, 4, '2026-12-31', 1),
(25, 5, '2026-12-31', 1),
(31, 6, '2026-12-31', 1),
(37, 7, '2026-12-31', 1),
(43, 8, '2026-12-31', 1),
(49, 9, '2026-12-31', 1),
(55, 10, '2026-12-31', 1),
(61, 11, '2026-12-31', 1),
(67, 12, '2026-12-31', 1),
(73, 13, '2026-12-31', 1),
(79, 14, '2026-12-31', 1),
(85, 15, '2026-12-31', 1),
(91, 16, '2026-12-31', 1),
(97, 17, '2026-12-31', 1),
(103, 18, '2026-12-31', 1),
(109, 19, '2026-12-31', 1),
(115, 20, '2026-12-31', 1);

-- 11. WEBSITE-WIDE COUPONS
INSERT IGNORE INTO coupon (coupon_code, discount_percent, min_order_value, expiry_date, is_active) VALUES
('WELCOME50', 50.00, 500, '2026-12-31', 1), ('FOOD20', 20.00, 300, '2026-12-31', 1);

-- 12. TRANSACTIONS & HISTORY
INSERT IGNORE INTO orders (user_id, restaurant_id, driver_id, price, delivery_address, status, payment_status) VALUES
(1, 1, 1, 450.00, 'Dhanmondi Lake', 'DELIVERED', 'PAID'),
(2, 2, 2, 320.00, 'Banani Road 11', 'DELIVERED', 'PAID'),
(3, 3, 3, 520.00, 'Gulshan Square', 'DELIVERED', 'PAID');

INSERT IGNORE INTO order_item (order_id, food_id, quantity) VALUES
(1, 1, 1), (2, 7, 1), (3, 15, 1);

INSERT IGNORE INTO restaurant_income (order_id, restaurant_id, payment, payment_date, has_delivered) VALUES
(1, 1, 400.00, CURDATE(), 1), (2, 2, 280.00, CURDATE(), 1), (3, 3, 470.00, CURDATE(), 1);

INSERT IGNORE INTO driver_income (order_id, driver_id, payment, payment_date, has_delivered) VALUES
(1, 1, 50.00, CURDATE(), 1), (2, 2, 40.00, CURDATE(), 1), (3, 3, 50.00, CURDATE(), 1);

-- 13. LEFTOVERS
INSERT IGNORE INTO leftover_available (res_id, food_id, made_on, quantity, status, pickup_time) VALUES
(1, 1, CURDATE(), 10, 'AVAILABLE', DATE_ADD(NOW(), INTERVAL 4 HOUR)),
(2, 7, CURDATE(), 5, 'AVAILABLE', DATE_ADD(NOW(), INTERVAL 2 HOUR));

SET FOREIGN_KEY_CHECKS = 1;

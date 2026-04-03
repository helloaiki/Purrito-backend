INSERT INTO restaurant (
    restaurant_id,
    res_name,
    email_address,
    password,
    street,
    city,
    postal_code,
    building_name,
    lat,
    lng,
    food_program,
    res_image_path,
    description,
    restaurant_type,
    trade_license_url,
    tin_certificate_url,
    is_approved,
    rejection_reason
)
VALUES (
    1,
    'Witches Brew',
    'wb@gmail.com',
    '$2b$08$uWvHBZJs4FNRYMb8d7fUU.rD9qGXXIMe3q6VTRFQpm43MU37EhQKu',
    'Baker''s Street',
    'Dhaka',
    '1000',
    'Brooker',
    23.74449865,
    90.39640792,
    1,
    'https://res.cloudinary.com/dxcjk9qhl/image/upload/v1775059812/purrito/restaurants/tdlx8rgnype30hmqqjis.png',
    'A warm lovely cafe',
    'Cafe',
    NULL,
    NULL,
    'APPROVED',
    NULL
);

INSERT INTO Restaurant_Menu (
    res_id,
    food_id,
    name,
    course_name,
    price,
    is_available,
    quantity_sold,
    food_image_path
)
VALUES (
    1,
    1,
    'Pineapple cocktail',
    'Drinks',
    12.00,
    1,
    3,
    'https://res.cloudinary.com/dxcjk9qhl/image/upload/v1775059882/purrito/menu-items/uhu6us5lqcrf0owcp1jp.png'
);

INSERT INTO driver (
    driver_id,
    user_name,
    email_address,
    password,
    verification_method,
    phone_number,
    join_date,
    lat,
    lng,
    last_active,
    verification_doc_url,
    is_approved,
    rejection_reason
)
VALUES (
    1,
    'Jack Roberts',
    'jr@gmail.com',
    '$2b$08$WWmXfOuXuWkNzwOjnLEszOwT2FXKmEoSsg1n3jozrTFnQX3gMOdCC',
    'license',
    '01762620010',
    '2026-04-01',
    23.74453000,
    90.39664100,
    '2026-04-01 23:07:08',
    'https://res.cloudinary.com/dxcjk9qhl/image/upload/v1775059945/purrito/drivers/tn7rg7z6fcioafuzbway.png',
    'PENDING',
    NULL
);

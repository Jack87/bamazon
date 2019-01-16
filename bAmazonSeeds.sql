USE bamazonDB;

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("10in Cast Iron Skillet", "Cookware", 14.99, 5),
("Cast Iron Grill Press Med", "Cookware", 8.97, 3), 
("Smartwatch", "Electronics", 89.99, 2),
("Chocolate Chip Cookie", "Food", 1.00, 30),
("Mechanical Keyboard", "Electronics", 69.99, 10),
("Recurve Bow", "Sporting Goods", 109.99, 7),
("Hiking Backpack", "Sporting Goods", 89.99, 2),
("Sectional Sofa", "Furniture", 599.79, 3),
("Potatoe Chips", "Food", 2.99, 50),
("Desk", "Furniture", 229.59, 0);

SELECT * FROM products;
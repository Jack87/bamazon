DROP DATABASE IF EXISTS bamazonDB;
CREATE database bamazonDB;

USE bamazonDB;

CREATE TABLE products (
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(50) NOT NULL,
  department_name VARCHAR(50) NULL,
  price DECIMAL(10,2) DEFAULT  0.00 NOT NULL,
  stock_quantity INT DEFAULT 0 NOT NULL,
  PRIMARY KEY (item_id)
);
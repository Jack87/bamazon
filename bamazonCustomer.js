var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table2");
var chalk = require("chalk");
var firstRun = require('first-run');
var Manager = require("./bamazonManager.js");
var Supervisor = require("./bamazonSupervisor.js");

var connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "letmein!",
    database: "bamazonDB"
  });
  
connection.connect(function(err) {
    if (err) throw err;
    // console.log("connected as id " + connection.threadId + "\n");
    firstRun.clear();
    if (firstRun) {renderLogo()};
    // Manager.managerTasks();
    displayAllProducts()
});

function renderLogo() {
    console.log('\033c'); // clears out the terminal.
    console.log(chalk.blue   (" _        _                                      "));
    console.log(chalk.blue   ("| |__    / \\    ___ __ _ _ ______ ___   __ _    "));
    console.log(chalk.yellow ("| `_ \\  / _ \\  / _ ' _` | '_ \\ __/ _ \\ / _` |"));
    console.log(chalk.yellow ("| |_) |/ ___ \\| | | | | | |_) \\_| (_) | | | |  "));
    console.log(chalk.green  ("|_,__//_/   \\_|_| |_| |_|_.__|___\\___/|_| |_|  "));
    console.log(chalk.magenta("bAmazon here to enhance your shopping experince. "));
    console.log(chalk.gray   ("──────────────────────────────────────────────── "));
}

function displayAllProducts() {
    var query = "SELECT * FROM products";
    connection.query(
        query,
        function(err, res) {
        if (err) throw err;
            // console.log(res)
            displayTable(res);
            selectProduct();
        }
    );
} 

function displayTable(data) {
    var table = new Table({
      head: ["SKU", "Product", "Department", "Price", "Quantity on Hand"],
      colWidths: [10, 30, 20, 10, 10],
      style: {
        border: [],
        header: []
      },
      wordWrap:true
    });
    for (var i = 0; i < data.length; i++) {
      table.push([
        data[i].item_id,
        data[i].product_name,
        data[i].department_name,
        "$"+data[i].price.toFixed(2),
        data[i].stock_quantity
      ]);
    }
    console.log(table.toString());
}

function selectProduct() {
    inquirer.prompt([
      {
        name    : "product_id",
        message : "Which product do you want to buy? (Enter the SKU)",
        validate: function (value) {
            if (value = "`manager"){
                Manager.managerTasks()
            } else {
                var valid = !isNaN(parseInt(value));
                return valid || 'Please enter a valid SKU.';
            }
        },
        filter: Number
      },
      {
        name    : "quantity",
        message : "And how many do you want to buy?",
        validate: function (value) {
          var valid = !isNaN(parseInt(value));
          return valid || 'Please enter a whole number';
        },
        filter: Number
      }
    ]).then(function(answers){
      checkStock(answers);
    });
}

function checkStock(answers) {
    var query  = "SELECT stock_quantity, price, product_name from products ";
        query += "WHERE item_id = ?";
    connection.query(
      query,
      answers.product_id,
      function (err, res) {
        if (err) throw err;
        var requestedQTY = parseInt(answers.quantity);
        var currentStock = parseInt(res[0].stock_quantity);
        var selectedItem = res[0].product_name;
        var itemPrice = res[0].price
        if (requestedQTY > currentStock) {
            if (currentStock > 0) {  
                console.log("Sorry! You requested " + chalk.blue(requestedQTY) + " of the " + chalk.blue(selectedItem) +"(s), but there is only " + chalk.blue(currentStock) + " available.");
            } else {
                console.log("Sorry! You requested " + chalk.blue(requestedQTY) + " of the " + chalk.blue(selectedItem) + "(s), but there is none in available.");
            }
            exitNow()
            // selectProduct();
        } else {
          var newQTY = currentStock - requestedQTY;
          updateQuantity(answers.product_id, newQTY);
          console.log(chalk.green("───────────────────────────────────────"));
          console.log(chalk.green(requestedQTY + " - " + selectedItem + ": $" + itemPrice.toFixed(2) ));
          console.log(chalk.green("---------------------------------------"))
          console.log(chalk.green("Your total purchase price is: $" + totalCost(requestedQTY, parseFloat(itemPrice))));
          console.log(chalk.green("───────────────────────────────────────"));
          exitNow();
        }
      }
    );
}

function totalCost(quantity, price) {
    return (quantity * price).toFixed(2);
};

function updateQuantity(id, newQTY) {
    var query  = "UPDATE products ";
        query += "SET stock_quantity = ? ";
        query += "WHERE item_id = ?";
    connection.query(
      query,
      [newQTY, id],
      function (err, res) {
        if (err) throw err;
      }
    );
}

function exitNow() {
    inquirer.prompt([
      {
          name: "exitNow",
          type: "list",
          message: "What would you like to do now?",
          choices : ["Keep Shopping", "Exit"]
      }
    ])
    .then(function (answers) {
      if (answers.exitNow === "Keep Shopping") {
        console.log('\033c'); // clears out the terminal... usually.
        displayAllProducts();
      } else {
        console.log('\033c'); // clears out the terminal.
        renderLogo()
        console.log(chalk.red("Thanks for shopping with bAmazon; come back soon!"));
        connection.end()
        process.exit();
      }
    });
}
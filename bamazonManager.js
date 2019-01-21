var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table2");
var chalk = require("chalk");

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

function viewProducts() {
    var query = "SELECT * FROM products";
    connection.query(
        query,
        function(err, res) {
        if (err) throw err;
            console.log(chalk.yellow("Products in System:"));
            displayTable(res);
            module.exports.managerTasks();
        }
    ); 
}

function viewLowQty() {
    var query = "SELECT * FROM products ";
       query += "WHERE stock_quantity < 6";
    connection.query(
        query,
        function(err, res) {
        if (err) throw err;
            console.log(chalk.yellow("Products with Low Inventroy:"));
            displayTable(res);
            module.exports.managerTasks();
        }
    ); 
}

function updateQOH() {
    inquirer.prompt([
      {
        name    : "adjID",
        message : "Which product do you want to update quantity on hand for? (Enter the SKU)",
        validate: function (value) {
                var valid = !isNaN(parseInt(value));
                return valid || 'Please enter a valid SKU.';
        },
        filter  : Number
      },
      {
        name    : "adjTasks",
        type    : "list",
        message : "What kind of adjustment would you like to do?",
        choices : ["Add to QOH", "Subtract from QOH"]
      },
      {
        name    : "adjQTY",
        message : "How much would you like to adjust?",
        validate: function (value) {
          var valid = !isNaN(parseInt(value));
          return valid || 'Please enter a whole number';
        },
        filter  : Number
      }
    ]).then(function(answers){
      checkStock(answers);
    });
}

function updatePrice() {
    inquirer.prompt([
      {
        name    : "adjID",
        message : "Which product do you want to update Price for? (Enter the SKU)",
        validate: function (value) {
                var valid = !isNaN(parseInt(value));
                return valid || 'Please enter a valid SKU.';
        },
        filter  : Number
      },
      {
        name    : "adjPrice",
        message : "How much would you like to sell this product for?",
        validate: function (value) {
          var valid = !isNaN(parseFloat(value));
          return valid || 'Please enter a valid dollar ammount X.XX';
        },
        filter  : Number
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
      answers.adjID,
      function (err, res) {
        if (err) throw err;
        var reqAdjQTY = parseInt(answers.adjQTY);
        var currentQTY = parseInt(res[0].stock_quantity);
        var selItem = res[0].product_name;
        var newQTY = ""
        if (answers.adjTasks === "Add to QOH"){
            newQTY = currentQTY + reqAdjQTY;
        } else if (answers.adjTasks === "Subtract from QOH"){
            newQTY = currentQTY - reqAdjQTY;
        }
        updateQuantity(answers.adjID, newQTY);
        console.log(chalk.yellow(selItem + " has QOH been updated there is now " + newQTY + " in stock."))
        module.exports.managerTasks();
        }
    )
}

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

function addProduct() {
    inquirer.prompt([
        {
            name    : "prdName",
            type    : "input",
            message : "What is the product name?"
            // filter  : String
        },
        {
            name    : "dptName",
            type    : "input",
            message : "What is the departmant this product belongs to?"
            // filter  : String
        },
        {
            name    : "itmPrice",
            message : "What price will this be sold for?",
            validate: function (value) {
              var valid = !isNaN(parseFloat(value));
              return valid || "Please enter a dollar value X.XX";
            },
            filter  : Number
        },
        {
            name    : "itmQTY",
            message : "How much is instock?",
            validate: function (value) {
                var valid = !isNaN(parseInt(value));
                return valid || "Please enter a whole number";
            },
            filter  : Number
        }
      ]).then(function(answers){
          createItem(toTitleCase(answers.prdName), toTitleCase(answers.dptName), parseFloat(answers.itmPrice), parseInt(answers.itmQTY));
          viewProducts();
          console.log(chalk.green(toTitleCase(answers.prdName) + " has been added to bAmazon inventory."));
      });  
}

function createItem(name, departmant, price, quantity) {
    var query  = "INSERT INTO products (product_name, department_name, price, stock_quantity) ";
        query += "VALUES (?, ?, ?, ?) ";
    connection.query(
    query,
    [name, departmant, price, quantity],
        function (err, res) {
            if (err) throw err;
        }
    );
}

// Title case a string
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
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


module.exports = {
    managerTasks: function () {
        console.log(chalk.yellow("Manager Console:"))
        inquirer.prompt([
            {
                name: "mgnrTasks",
                type: "list",
                message: "What would you like to do?",
                choices : ["View Inventory", "View Low Inventory", "Update QOH", "Update Price", "Add New Product", "Exit"]
            }
            ])
        .then(function (answers) {
            if (answers.mgnrTasks === "View Inventory") {
                viewProducts();
            } else if (answers.mgnrTasks === "View Low Inventory") {
                viewLowQty();
            } else if (answers.mgnrTasks === "Update QOH") {
                updateQOH();
            } else if (answers.mgnrTasks === "Update Price") {
                updatePrice();
            } else if (answers.mgnrTasks === "Add New Product") {
                addProduct();
            } else {
                console.log('\033c'); // clears out the terminal.
                renderLogo()
                console.log(chalk.red("Thanks for managing bAmazon store; come back soon!"));
                process.exit();
            }
        });
    },
    bar: function () {
      // whatever
    }
  };
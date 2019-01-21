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
        inquirer.prompt([
            {
                name: "mgnrTasks",
                type: "list",
                message: "What would you like to do?",
                choices : ["View Products for Sale", "View Low Inventory","Add to Inventory","Add New Product", "Exit"]
            }
            ])
        .then(function (answers) {
            if (answers.mgnrTasks === "View Products for Sale") {
                console.log('\033c'); // clears out the terminal... usually.
                viewProducts();
            } else if (answers.mgnrTasks === "View Low Inventory") {
                console.log('\033c'); // clears out the terminal... usually.
                viewLowQty();
            } else {
                console.log('\033c'); // clears out the terminal.
                renderLogo()
                console.log(chalk.red("Thanks for shopping with bAmazon; comeback soon!"));
                process.exit();
            }
        });
    },
    bar: function () {
      // whatever
    }
  };
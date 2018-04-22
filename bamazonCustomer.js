// require inquirey, mysql
var mysql = require("mysql");
var inquirer = require("inquirer");
// create th connection information for the sql database
var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "",
    database: "bamazonDB" //create database on mysql
});
// establish connection to the table
connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    displayItems();
});

// This prompts the user to make an order selection
function userOptions() {
    inquirer.prompt([{
            type: "input",
            message: "What product would you like to buy?\n",
            name: "item_id"
        }])
        // this uses the item id to make the selection
        .then(function (answer) {
            itemSearch(answer.item_id)
        })
}
// display items' names and prices from the products table
function displayItems() {
    console.log("Available items...\n");
    var query = connection.query(
        "SELECT * FROM products",
        function (err, result, fields) {
            if (err) throw err;
            result.forEach(function (row) {
                console.log(row.item_id + ". " + row.product_name + " : " + row.price);
            });
        })
        // 
        userOptions();
}

// This uses the id that the user entered to select the count
function itemSearch(id) {
    inquirer.prompt([{
            type: "input",
            message: "How many would you like to buy?",
            name: "stock_quantity"
        }])
        // This keeps tracks of orders and updates database
        .then(function (answer) {
            var query = "SELECT * from products WHERE ?";
            connection.query(query, {
                item_id: id
            }, function (err, result) {
                if (err) throw err;
                // If the item is available, the data will be entered and the database will be updated.
                if (result[0].stock_quantity > answer.stock_quantity) {
                    console.log("We have enough");
                    var query = connection.query(
                        "UPDATE products SET ? WHERE ?", [{
                                stock_quantity: result[0].stock_quantity - answer.stock_quantity
                            },
                            {
                                item_id: id
                            }
                        ],
                        // This shows total cost to customer
                        function (err, res) {
                            console.log(result[0].price * answer.stock_quantity + " is your total price.\n");
                        }
                    );
                // this string is displayed is the item is not available.
                } else {
                    console.log("Insufficient Quantity");
                }
            });
        });
}
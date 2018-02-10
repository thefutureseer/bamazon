
// Require prompt node package 
var prompt = require('prompt');

// Require mySQL node package
var mysql = require('mysql');

// Require my homegrown table padding function
var padText = require('./padTable.js')


// Link to mySQL Database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root", //Your username
    password: "Iforget123", //Your password
    database: "Bamazon"
});

// Connect to Database
connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);

  // ------------------------------ Nest Switch Case into here (to be shown after connected) -------------------------------
  // Prompt user with options (note I could have used inquier to make a list, but the assignment seemed to prefer prompt)
  prompt.start();

  // Display Menu
  console.log('\nBamazon Shift Manager Menu'); // <---- Oh the irony! The sweet, sweet irony!
  console.log('----------------------------')
  console.log('Select a (numeric) option.')
  console.log('1. View Products for Sale');
  console.log('2. View Low Inventory');
  console.log('3. Add to Inventory');
  console.log('4. Add New Product');

  prompt.get(['menuSelection'], function (err, result) {
    
    // Switch Case for different options
    var menuSelection = parseInt(result.menuSelection);

    switch(menuSelection) {
      case 1:
          console.log('\nView Products for Sale...');
          viewProducts(function(){}); // note that this function uses a callback :)
          connection.end(); // end the script/connection
          break;
      
      case 2:
          console.log('\nView Low Inventory...');
          viewLowInventory();
          connection.end(); // end the script/connection
          break;
      
      case 3:
        console.log('\nAdd to Inventory...');
        addInventory();
        break;

      case 4:
        console.log('\nAdd New Product...');
        addNewProduct();
        break;

      default:
        console.log('Not a vaild entry. Aborting.');
        connection.end(); // end the script/connection

    } // end switch case
    
  }); // end switch case prompt

}); // end connection



// =================== Functions to be used inside the switch case ===================


// View Products for sale (complete with a callback function)
function viewProducts(callback){

  // Display All Items inside Database
  connection.query('SELECT * FROM Products', function(err, res){
  
    // Error Handler
    if(err) throw err;

    // Show User message
    console.log('Total FC Inventory is below...\n'); // another Easter Egg ;)

    // Set up table header
    console.log('  ID  |      Product Name      |  Department Name  |   Price  | In Stock');
    console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ')
    
    // Loop through database and show all items
    for(var i = 0; i < res.length; i++){

      // ---------- Add in padding for table ----------
      var itemID = res[i].ItemID + ''; // convert to string
      itemID = padText("  ID  ", itemID);

      var productName = res[i].ProductName + ''; // convert to string
      productName = padText("      Product Name      ", productName);

      var departmentName = res[i].DepartmentName + ''; // convert to string
      departmentName = padText("  Department Name  ", departmentName);

      var price = '$' + res[i].Price.toFixed(2) + ''; // convert to string
      price = padText("   Price  ", price);

      var quantity = res[i].StockQuantity + ''; // convert to string (no need to pad)
      // ----------------------------------------------

      // Log table entry
      console.log(itemID + '|' + productName + '|' + departmentName + '|' + price + '|    ' + quantity);
    }
    // Callback function (for use in case 3 to counter asynch behavior)
    callback();
  });
}

// ---------------------------------------------------------------------------------

// View Low Inventory
function viewLowInventory(){
   // Display All Items inside Database lower than 5 in stock
  connection.query('SELECT * FROM Products WHERE StockQuantity < 5', function(err, res){
  
    // Error Handler
    if(err) throw err;

    // Show User message
    console.log('Inventory for Items < 5 In Stock is below...\n');

    // Set up table header
    console.log('  ID  |      Product Name      |  Department Name  |   Price  | In Stock');
    console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - ')
    
    // Loop through database and show all items
    for(var i = 0; i < res.length; i++){

      // ---------- Add in padding for table ----------
      var itemID = res[i].ItemID + ''; // convert to string
      itemID = padText("  ID  ", itemID);

      var productName = res[i].ProductName + ''; // convert to string
      productName = padText("      Product Name      ", productName);

      var departmentName = res[i].DepartmentName + ''; // convert to string
      departmentName = padText("  Department Name  ", departmentName);

      var price = '$' + res[i].Price.toFixed(2) + ''; // convert to string
      price = padText("   Price  ", price);

      var quantity = res[i].StockQuantity + ''; // convert to string (no need to pad)
      // ----------------------------------------------

      // Log table entry
      console.log(itemID + '|' + productName + '|' + departmentName + '|' + price + '|    ' + quantity);
    }

    // Yet another Easter Egg ;)
    console.log('\nBetter get stowing!')
  });
}


// ---------------------------------------------------------------------------------

// Add to Inventory
function addInventory(){
  
  // Running the View Products Function (case 1) and then asking user for unput after callback
  viewProducts(function(){

    // Prompt user for re-stock item
    prompt.start();
    console.log('\nWhich item do you want to restock?');
    prompt.get(['restockItemID'], function (err, result) {
      
      // Show Item ID selected
      var restockItemID = result.restockItemID;
      console.log('You selected to re-stock Item # ' + restockItemID + '.');

      // Prompt for how many more items
      console.log('\nHow many items will you restock?');
      prompt.get(['restockCount'], function(err, result){
        
        //Show Restock Count selected
        var restockCount = result.restockCount;
        console.log('You selected to re-stock ' + restockCount + ' items.');
        restockCount = parseInt(restockCount); // convert to integer

        if(Number.isInteger(restockCount)){

          // Query for current item inventory
          connection.query('SELECT StockQuantity FROM Products WHERE ?', [{ItemID: restockItemID}], function(err, res){

            // Check if the item Id was valid (i.e. something was returned from mySQL)
            if(res[0] == undefined){
              
              console.log('Sorry... We found no items with Item ID "' +  restockItemID + '"');
              connection.end(); // end the script/connection

            }
            // Valid Item ID, so add Bamazon Inventory with stowing quantity <-- more Bamazon lingo ;)
            else{
              
              var bamazonQuantity = res[0].StockQuantity;
              var newInventory = parseInt(bamazonQuantity) + parseInt(restockCount); // ensure integers

              // Update Database with new items
              connection.query('UPDATE Products SET ? WHERE ?', [{StockQuantity: newInventory}, {ItemID: restockItemID}], function(err, res){
                if(err) throw err; // Error Handler

                console.log('\nInventory updated successfully! How customer-centric!') // Inside jokes for days!
                connection.end(); // end the script/connection

              }); // end inventory update query
            
            }

          }); // end current quantity query
        }
        else{
          console.log('Only whole items can be added. Integers only!')
          connection.end(); // end the script/connection
        }

      }); // end prompt 2 (amount to add)

    }); // end prompt 1 (item id)

  }); // end case 1 callback

}


// ---------------------------------------------------------------------------------

// Add New Product
function addNewProduct(){

  // Prompt user for new item details
  prompt.start();
  console.log('\nComplete the new product details:');
  prompt.get(['ProductName', 'DepartmentName', 'Price', 'Quantity'], function (err, result) {

    // Collect/parse variables
    var productName = result.ProductName;
    var departmentName = result.DepartmentName;
    var price = result.Price;
    var quantity = result.Quantity;

    // Update Database
    connection.query('INSERT INTO Products SET ?', {
      ProductName: productName,
      DepartmentName: departmentName,
      Price: price,
      StockQuantity: quantity
    }, function(err, res){

      // Slighly more refined Error Handler
      if(err){
        console.log('\nSorry. The SQL database could not be updated.\n' +
          'Please ensure you entered the price and quantity as numbers!');
        connection.end(); // end the script/connection
      }
      else{
        console.log('\nInventory updated successfully!')
        connection.end(); // end the script/connection
      }

    });

  });

}

$(document).ready(function () {
    // Handle Customer Report button click
    $("#customerReport").click(function () {
        displayCustomerReportOptions();
    });

    // Handle Sales Report button click
    $("#salesReport").click(function () {
        displaySalesReportOptions();
    });

    // Handle Inventory Report button click
    $("#inventoryReport").click(function () {
        displayInventoryReportOptions();
    });

    // Event listener for Generate Report button
    $("#generateReport").click(function () {
        const fromDate = $("#fromDate").val();
        const toDate = $("#toDate").val();
        
        if (new Date(fromDate) > new Date(toDate)) {
            alert("From date can't be larger than To date");
            return;
        }
        
        const reportType = $("#reportOptions select").val();
        
        // Customer Reports
        if (reportType === "All customers"){
            generateAllCustomersReport(fromDate, toDate);
        }
        else if (reportType === "Top 10 Customers") {
            generateTopCustomersReport(fromDate, toDate);
        } else if (reportType === "Cash Purchase Report") {
            generateCashPurchaseReport(fromDate, toDate);
        } else if (reportType === "Credit Purchase Report") {
            generateCreditPurchaseReport(fromDate, toDate);
        }

        // Inventory Reports
        else if (reportType === "Current Stock") {
            generateInventoryReport();
        } else if (reportType === "High Stock") {
            generateHighStockReport();
        } else if (reportType === "Low Stock") {
            generateLowStockReport();
        }

        // Sales Reports
        else if (reportType === "All Sales") {
            generateSalesReport(fromDate, toDate, 'all');
        } else if (reportType === "Category Wise Sales") {
            categorySalesReport(fromDate, toDate, 'category');
        } else if (reportType === "Cash Wise Sales") {
            generateSalesReport(fromDate, toDate, 'cash');
        } else if (reportType === "Credit Wise Sales") {
            generateSalesReport(fromDate, toDate, 'credit');
        } else if (reportType === "Top 10 Selling Items") {
            generateTopSellingItemsReport(fromDate, toDate);
        } else if (reportType === "Bottom 10 Selling Items") {
            generateBottomSellingItemsReport(fromDate, toDate);
        }
    });
});

function displayCustomerReportOptions() {
    $("#reportOptions").html(`
        <label for="reportType">Choose Customer Report:</label>
        <select id="reportType">
            <option value="All customers">All customers</option>
            <option value="Top 10 Customers">Top 10 Customers</option>
            <option value="Cash Purchase Report">Cash Purchase Report</option>
            <option value="Credit Purchase Report">Credit Purchase Report</option>
        </select>
    `);
    $("#dateSelection").show();
}

function displaySalesReportOptions() {
    $("#reportOptions").html(`
        <label for="reportType">Choose Sales Report:</label>
        <select id="reportType">
            <option value="All Sales">All Sales</option>
            <option value="Category Wise Sales">Category Wise Sales</option>
            <option value="Cash Wise Sales">Cash Wise Sales</option>
            <option value="Credit Wise Sales">Credit Wise Sales</option>
            <option value="Top 10 Selling Items">Top 10 Selling Items</option>
            <option value="Bottom 10 Selling Items">Bottom 10 Selling Items</option>
        </select>
    `);
    $("#dateSelection").show();
}

function displayInventoryReportOptions() {
    $("#reportOptions").html(`
        <label for="reportType">Choose Inventory Report:</label>
        <select id="reportType">
            <option value="Current Stock">Current Stock</option>
            <option value="High Stock">High Stock</option>
            <option value="Low Stock">Low Stock</option>
        </select>
    `);
    $("#dateSelection").show(); // No need for date selection for inventory reports
}

// Customer Report Generation

// function generateTopCustomersReport(fromDate, toDate) {
//     // First, fetch the customer emails from the customer table
//     $.ajax({
//         url: `https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/customer`,
//         type: 'GET',
//         success: function (customerResponse) {
//             let customers = [];

//             // Iterate through each customer and match with order_history table
//             customerResponse.documents.forEach(customerDoc => {
//                 const customerEmail = customerDoc.fields.email.stringValue; // Fetch email from customer table
                
//                 // Now, fetch the order history for this customer using their email (document ID)
//                 $.ajax({
//                     url: `https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/order_history/${customerEmail}`,
//                     type: 'GET',
//                     success: function (orderResponse) {
//                         const orders = orderResponse.fields.orders.arrayValue.values.filter(order => {
//                             const date = new Date(order.mapValue.fields.date.stringValue);
//                             return date >= new Date(fromDate) && date <= new Date(toDate);
//                         });

//                         // Correct summation of totalAmount by parsing the amount as an integer
//                         const totalAmount = orders.reduce((sum, order) => sum + parseInt(order.mapValue.fields.amount.integerValue, 10), 0);

//                         if (orders.length > 0) {
//                             customers.push({ email: customerEmail, totalAmount });
//                         }

//                         // After processing all customers, generate the CSV
//                         if (customers.length === customerResponse.documents.length) {
//                             // Sort customers by total amount in descending order and take the top 10
//                             customers = customers.sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 10);

//                             // Generate the CSV content
//                             let csvContent = "data:text/csv;charset=utf-8,Email,Total Amount\n";
//                             customers.forEach(cust => {
//                                 csvContent += `${cust.email},${cust.totalAmount}\n`;
//                             });

//                             downloadCSV(csvContent, 'top_10_customers.csv');
//                         }
//                     },
//                     error: function (error) {
//                         console.error(`Error fetching order history for ${customerEmail}:`, error);
//                     }
//                 });
//             });
//         },
//         error: function (error) {
//             console.error("Error fetching customer data:", error);
//         }
//     });
// }

function generateAllCustomersReport(fromDate, toDate) {
    // Fetch all customer order histories from the order_history table
    $.ajax({
        url: `https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/order_history`,
        type: 'GET',
        success: function (orderHistoryResponse) {
            let customers = [];

            // Iterate through each document in the order_history table
            orderHistoryResponse.documents.forEach(doc => {
                const customerEmail = doc.name.split('/').pop(); // Extract the email ID (document ID)

                // Filter the orders within the specified date range
                const orders = doc.fields.orders.arrayValue.values.filter(order => {
                    const date = new Date(order.mapValue.fields.date.stringValue);
                    return date >= new Date(fromDate) && date <= new Date(toDate);
                });

                // Sum up the total amount for the customer in the specified date range
                const totalAmount = orders.reduce((sum, order) => sum + parseInt(order.mapValue.fields.amount.integerValue, 10), 0);

                // Add customer details to the array
                if (orders.length > 0) {
                    customers.push({ email: customerEmail, totalAmount });
                }
            });

            // Generate the CSV content with all customers and their total amounts
            generateCustomerCSV1(customers);
        },
        error: function (error) {
            console.error("Error fetching order history:", error);
        }
    });
}
//helper for above
// Function to generate CSV for customers
function generateCustomerCSV1(customers) {
    // Generate the CSV content
    let csvContent = "data:text/csv;charset=utf-8,Email,Total Amount\n";
    customers.forEach(cust => {
        csvContent += `${cust.email},${cust.totalAmount}\n`;
    });

    // Download the CSV
    downloadCSV(csvContent, 'all_customers_report.csv');
}

function generateTopCustomersReport(fromDate, toDate) {
    // First, fetch the customer emails from the customer table
    $.ajax({
        url: `https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/customer`,
        type: 'GET',
        success: function (customerResponse) {
            let customers = [];

            // Track how many customers have been processed
            let processedCount = 0;

            // Iterate through each customer and match with order_history table
            customerResponse.documents.forEach(customerDoc => {
                const customerEmail = customerDoc.fields.email.stringValue; // Fetch email from customer table

                // Now, fetch the order history for this customer using their email (document ID)
                $.ajax({
                    url: `https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/order_history/${customerEmail}`,
                    type: 'GET',
                    success: function (orderResponse) {
                        const orders = orderResponse.fields && orderResponse.fields.orders 
                            ? orderResponse.fields.orders.arrayValue.values.filter(order => {
                                const date = new Date(order.mapValue.fields.date.stringValue);
                                return date >= new Date(fromDate) && date <= new Date(toDate);
                            })
                            : [];

                        // Correct summation of totalAmount by parsing the amount as an integer
                        const totalAmount = orders.reduce((sum, order) => sum + parseInt(order.mapValue.fields.amount.integerValue, 10), 0);

                        customers.push({ email: customerEmail, totalAmount });

                        // Increment processedCount and check if all customers are processed
                        processedCount++;
                        if (processedCount === customerResponse.documents.length) {
                            generateCustomerCSV(customers);
                        }
                    },
                    error: function (error) {
                        console.error(`No order history for ${customerEmail}. Assuming 0 total amount.`);
                        // In case of no order history, add the customer with 0 totalAmount
                        customers.push({ email: customerEmail, totalAmount: 0 });

                        // Increment processedCount and check if all customers are processed
                        processedCount++;
                        if (processedCount === customerResponse.documents.length) {
                            generateCustomerCSV(customers);
                        }
                    }
                });
            });
        },
        error: function (error) {
            console.error("Error fetching customer data:", error);
        }
    });
}
//helper function for top 10 report
function generateCustomerCSV(customers) {
    // Sort customers by total amount in descending order and take the top 10
    customers = customers.sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 10);

    // Generate the CSV content
    let csvContent = "data:text/csv;charset=utf-8,Email,Total Amount\n";
    customers.forEach(cust => {
        csvContent += `${cust.email},${cust.totalAmount}\n`;
    });

    downloadCSV(csvContent, 'top_10_customers.csv');
}

function generateCashPurchaseReport(fromDate, toDate) {
    $.ajax({
        url: `https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/order_history`,
        type: 'GET',
        success: function (response) {
            let cashPurchases = [];

            response.documents.forEach(doc => {
                const customerEmail = doc.name.split('/').pop(); // Extract the email ID (document ID)

                const orders = doc.fields.orders.arrayValue.values.filter(order => {
                    const date = new Date(order.mapValue.fields.date.stringValue);
                    const paymentMethod = order.mapValue.fields.paymentMethod.stringValue;
                    return paymentMethod === 'cash' && date >= new Date(fromDate) && date <= new Date(toDate);
                });

                orders.forEach(order => {
                    cashPurchases.push({
                        email: customerEmail,
                        amount: order.mapValue.fields.amount.integerValue,
                        date: order.mapValue.fields.date.stringValue
                    });
                });
            });

            // Generate the CSV content
            let csvContent = "data:text/csv;charset=utf-8,Email,Total Amount,Purchase Date\n";
            cashPurchases.forEach(purchase => {
                csvContent += `${purchase.email},${purchase.amount},${purchase.date}\n`;
            });

            downloadCSV(csvContent, 'cash_purchase_report.csv');
        },
        error: function (error) {
            console.error("Error fetching cash purchase report data:", error);
        }
    });
}

function generateCreditPurchaseReport(fromDate, toDate) {
    $.ajax({
        url: `https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/order_history`,
        type: 'GET',
        success: function (response) {
            let creditPurchases = [];

            response.documents.forEach(doc => {
                const customerEmail = doc.name.split('/').pop(); // Extract the email ID (document ID)

                const orders = doc.fields.orders.arrayValue.values.filter(order => {
                    const date = new Date(order.mapValue.fields.date.stringValue);
                    const paymentMethod = order.mapValue.fields.paymentMethod.stringValue;
                    return paymentMethod === 'credit' && date >= new Date(fromDate) && date <= new Date(toDate);
                });

                orders.forEach(order => {
                    creditPurchases.push({
                        email: customerEmail,
                        amount: order.mapValue.fields.amount.integerValue,
                        date: order.mapValue.fields.date.stringValue
                    });
                });
            });

            // Generate the CSV content
            let csvContent = "data:text/csv;charset=utf-8,Email,Total Amount,Purchase Date\n";
            creditPurchases.forEach(purchase => {
                csvContent += `${purchase.email},${purchase.amount},${purchase.date}\n`;
            });

            downloadCSV(csvContent, 'credit_purchase_report.csv');
        },
        error: function (error) {
            console.error("Error fetching credit purchase report data:", error);
        }
    });
}


// Inventory Report Generation

function generateInventoryReport() {
    $.ajax({
        url: `https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/inventory`,
        type: 'GET',
        success: function (response) {
            const inventory = response.documents;
            
            let csvContent = "data:text/csv;charset=utf-8,Item ID,Name,Quantity,Stock Status\n";
            inventory.forEach(item => {
                const itemId = item.fields.item_id.integerValue;
                const name = item.fields.name.stringValue;
                const quantity = item.fields.quantity.integerValue;
                let stockStatus = "Moderate";
                if (quantity > 100) stockStatus = "High";
                if (quantity <= 15) stockStatus = "Low";

                csvContent += `${itemId},${name},${quantity},${stockStatus}\n`;
            });

            downloadCSV(csvContent, 'current_inventory_report.csv');
        },
        error: function (error) {
            console.error("Error fetching inventory report data:", error);
        }
    });
}

function generateHighStockReport() {
    $.ajax({
        url: `https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/inventory`,
        type: 'GET',
        success: function (response) {
            const inventory = response.documents.filter(item => item.fields.quantity.integerValue > 100);
            
            let csvContent = "data:text/csv;charset=utf-8,Item ID,Name,Quantity,Stock Status\n";
            inventory.forEach(item => {
                const itemId = item.fields.item_id.integerValue;
                const name = item.fields.name.stringValue;
                const quantity = item.fields.quantity.integerValue;
                csvContent += `${itemId},${name},${quantity},High\n`;
            });

            downloadCSV(csvContent, 'high_stock_report.csv');
        },
        error: function (error) {
            console.error("Error fetching high stock report data:", error);
        }
    });
}

function generateLowStockReport() {
    $.ajax({
        url: `https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/inventory`,
        type: 'GET',
        success: function (response) {
            const inventory = response.documents.filter(item => item.fields.quantity.integerValue <= 15);
            
            let csvContent = "data:text/csv;charset=utf-8,Item ID,Name,Quantity,Stock Status\n";
            inventory.forEach(item => {
                const itemId = item.fields.item_id.integerValue;
                const name = item.fields.name.stringValue;
                const quantity = item.fields.quantity.integerValue;
                csvContent += `${itemId},${name},${quantity},Low\n`;
            });

            downloadCSV(csvContent, 'low_stock_report.csv');
        },
        error: function (error) {
            console.error("Error fetching low stock report data:", error);
        }
    });
}

// Sales Report Generation

function generateSalesReport(fromDate, toDate, type) {
    $.ajax({
        url: `https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/order_history`,
        type: 'GET',
        success: function (response) {
            let csvContent = "data:text/csv;charset=utf-8,Item ID,Quantity,Total Amount,Purchase Date,Payment Method\n";
            const sales = response.documents;

            sales.forEach(doc => {
                const email = doc.name.split('/').pop(); // Extract email ID (document ID)
                const orders = doc.fields.orders.arrayValue.values;

                orders.forEach(order => {
                    const date = new Date(order.mapValue.fields.date.stringValue);
                    const paymentMethod = order.mapValue.fields.paymentMethod.stringValue;
                    const totalAmount = order.mapValue.fields.amount.integerValue;

                    if (date >= new Date(fromDate) && date <= new Date(toDate)) {
                        order.mapValue.fields.items.arrayValue.values.forEach(item => {
                            const itemId = item.mapValue.fields.itemId.integerValue;
                            const quantity = item.mapValue.fields.quantity.integerValue;

                            // Check if the report type matches
                            if (type === 'all' || (type === paymentMethod.toLowerCase())) {
                                csvContent += `${itemId},${quantity},${totalAmount},${date.toISOString()},${paymentMethod}\n`;
                            }
                        });
                    }
                });
            });

            downloadCSV(csvContent, `${type}_sales_report.csv`);
        },
        error: function (error) {
            console.error("Error fetching sales report data:", error);
        }
    });
}

function generateTopSellingItemsReport(fromDate, toDate) {
    $.ajax({
        url: `https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/order_history`,
        type: 'GET',
        success: function (response) {
            let itemSalesCount = {};

            const sales = response.documents;

            sales.forEach(doc => {
                const orders = doc.fields.orders.arrayValue.values;

                orders.forEach(order => {
                    const date = new Date(order.mapValue.fields.date.stringValue);
                    if (date >= new Date(fromDate) && date <= new Date(toDate)) {
                        order.mapValue.fields.items.arrayValue.values.forEach(item => {
                            const itemId = item.mapValue.fields.itemId.integerValue; // Get item ID
                            const quantity = parseInt(item.mapValue.fields.quantity.integerValue, 10); // Parse quantity as integer

                            if (itemSalesCount[itemId]) {
                                itemSalesCount[itemId] += quantity; // Sum quantities
                            } else {
                                itemSalesCount[itemId] = quantity; // Initialize quantity
                            }
                        });
                    }
                });
            });

            let sortedItems = Object.entries(itemSalesCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
            let csvContent = "data:text/csv;charset=utf-8,Item ID,Quantity Sold\n";
            sortedItems.forEach(([itemId, quantity]) => {
                csvContent += `${itemId},${quantity}\n`;
            });

            downloadCSV(csvContent, 'top_10_selling_items.csv');
        },
        error: function (error) {
            console.error("Error fetching top selling items data:", error);
        }
    });
}
//category sales report
function categorySalesReport(fromDate, toDate) {
    // Step 1: Fetch all inventory data to get item details including category
    $.ajax({
        url: `${inventoryAPI}`, // Use your predefined inventoryAPI URL
        method: 'GET',
        dataType: 'json',
        success: function (inventoryData) {
            let inventoryMap = {}; // Store item_id to category mapping
            inventoryData.documents.forEach(item => {
                const itemId = item.fields.item_id.integerValue;
                const catId = item.fields.categoryID.integerValue; // Adjusted to match your category field name
                const price = item.fields.price.doubleValue || item.fields.price.integerValue;

                inventoryMap[itemId] = {
                    catId: catId,
                    price: parseInt(price, 10)
                };
            });

            // Step 2: Fetch all category data to get category names
            $.ajax({
                url: `https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/category`, // Adjusted to your project structure
                method: 'GET',
                dataType: 'json',
                success: function (categoryData) {
                    let categoryMap = {}; // Store category_id to category_name mapping
                    categoryData.documents.forEach(category => {
                        const categoryId = category.fields.category_id.integerValue; // Adjusted to match your category structure
                        const categoryName = category.fields.name.stringValue;

                        categoryMap[categoryId] = categoryName;
                    });

                    // Step 3: Fetch all order history data to calculate sales per category
                    $.ajax({
                        url: `https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/order_history`, 
                        method: 'GET',
                        dataType: 'json',
                        success: function (orderHistoryData) {
                            let categorySales = {}; // Store sales per category

                            orderHistoryData.documents.forEach(doc => {
                                const orders = doc.fields.orders.arrayValue.values;

                                orders.forEach(order => {
                                    const date = new Date(order.mapValue.fields.date.stringValue);
                                    if (date >= new Date(fromDate) && date <= new Date(toDate)) {
                                        const items = order.mapValue.fields.items.arrayValue.values;

                                        items.forEach(item => {
                                            const itemId = item.mapValue.fields.itemId.integerValue;
                                            const quantity = parseInt(item.mapValue.fields.quantity.integerValue, 10);

                                            // Find item in the inventory and get the category ID and price
                                            if (inventoryMap[itemId]) {
                                                const catId = inventoryMap[itemId].catId;
                                                const price = inventoryMap[itemId].price;
                                                const totalAmount = price * quantity;

                                                // Find category name
                                                const categoryName = categoryMap[catId] || 'Unknown Category';

                                                // Add to category sales
                                                if (!categorySales[categoryName]) {
                                                    categorySales[categoryName] = 0;
                                                }
                                                categorySales[categoryName] += totalAmount;
                                            }
                                        });
                                    }
                                });
                            });

                            // Step 4: Generate CSV from category sales data
                            let csvContent = "data:text/csv;charset=utf-8,Category,Total Sales Amount\n";
                            Object.keys(categorySales).forEach(category => {
                                csvContent += `${category},${categorySales[category]}\n`;
                            });

                            // Download the CSV file
                            downloadCSV(csvContent, 'sales_by_category.csv');
                        },
                        error: function (error) {
                            console.error('Error fetching order history data:', error);
                        }
                    });
                },
                error: function (error) {
                    console.error('Error fetching category data:', error);
                }
            });
        },
        error: function (error) {
            console.error('Error fetching inventory data:', error);
        }
    });
}



function generateBottomSellingItemsReport(fromDate, toDate) {
    $.ajax({
        url: `https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/order_history`,
        type: 'GET',
        success: function (response) {
            let itemSalesCount = {};

            const sales = response.documents;

            sales.forEach(doc => {
                const orders = doc.fields.orders.arrayValue.values;

                orders.forEach(order => {
                    const date = new Date(order.mapValue.fields.date.stringValue);
                    if (date >= new Date(fromDate) && date <= new Date(toDate)) {
                        order.mapValue.fields.items.arrayValue.values.forEach(item => {
                            const itemId = item.mapValue.fields.itemId.integerValue; // Get item ID
                            const quantity = parseInt(item.mapValue.fields.quantity.integerValue, 10); // Parse quantity as integer

                            if (itemSalesCount[itemId]) {
                                itemSalesCount[itemId] += quantity; // Sum quantities
                            } else {
                                itemSalesCount[itemId] = quantity; // Initialize quantity
                            }
                        });
                    }
                });
            });

            let sortedItems = Object.entries(itemSalesCount).sort((a, b) => a[1] - b[1]).slice(0, 10);
            let csvContent = "data:text/csv;charset=utf-8,Item ID,Quantity Sold\n";
            sortedItems.forEach(([itemId, quantity]) => {
                csvContent += `${itemId},${quantity}\n`;
            });

            downloadCSV(csvContent, 'bottom_10_selling_items.csv');
        },
        error: function (error) {
            console.error("Error fetching bottom selling items data:", error);
        }
    });
}



// Helper function to download CSV
function downloadCSV(csvContent, filename) {
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link); // Required for FF
    link.click();
}

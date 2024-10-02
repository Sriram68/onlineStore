var countersAPI = "https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/counters";
var cartAPI = "https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/cart";
var inventoryAPI = "https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/inventory";
var usersAPI = "https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/customer";
var categoryAPI = "https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/category";

$(document).ready(function () {
    let darkMode = false; // Set initial mode as light
    
    // Append the dark mode toggle button
    $('body').append('<div id="darkModeToggle">🌞</div>');
    
    // Dark Mode toggle functionality
    $('#darkModeToggle').click(function () {
        darkMode = !darkMode;
        if (darkMode) {
            $('body').addClass('dark-mode');
            $('#darkModeToggle').text('🌚'); // Change icon to moon
        } else {
            $('body').removeClass('dark-mode');
            $('#darkModeToggle').text('🌞'); // Change icon to sun
        }
    });
});


// Admin add inventory
$(document).ready(function () {
    // Show the Add Item form when the button is clicked
    $("#showAddItemFormBtn").click(function () {
        $("#addItemForm").toggle(); // Toggle visibility of the form
    });
});
$(document).ready(function() {
    // Create a function to dynamically load forms into the container
    function showForm(formHtml) {
        $("#dynamicFormContainer").html(formHtml);
    }

    // Event handler for "Add a New Item" button
    $('#showAddItemFormBtn').click(function() {
        const addItemFormHtml = `
            <form id="addItemForm">
                <h3>Add an item into the inventory</h3>
                <label for="itemName">Item Name:</label>
                <input type="text" id="itemName" required>
                <label for="itemPrice">Item Price:</label>
                <input type="number" id="itemPrice" required>
                <label for="itemQuantity">Item Quantity:</label>
                <input type="number" id="itemQuantity" required>
                <label for="itemDesc">Item Description:</label>
                <textarea id="itemDesc" required></textarea>
                <label for="itemCategory">Category Name:</label>
                <input type="text" id="itemCategory" required>
                <label for="itemImage">Item Image (.png or .jpg):</label>
                <input type="file" id="itemImage" accept=".png, .jpg" required>
                <button id="addItemButton" type="submit">Add Item</button>
            </form>
        `;
        showForm(addItemFormHtml);
    });

    // Event handler for "Update Inventory Items" button
    $('#updateItemBtn').click(function() {
        const updateItemFormHtml = `
            <form id="updateItemForm">
                <h3>Update an inventory item</h3>
                <input type="text" id="itemName2" placeholder="Enter Item Name" required>
                <input type="number" id="itemPrice2" placeholder="Enter Item Price" required>
                <input type="number" id="itemQuantity2" placeholder="Enter Item Quantity" required>
                <input type="text" id="itemDesc2" placeholder="Enter description" required>
                <button id="submitUpdateBtn">Update Item</button>
            </form>
        `;
        showForm(updateItemFormHtml);
    });

    // Event handler for "Check Item Availability" button
    $('#checkAvailabilityBtn').click(function() {
        const checkAvailabilityFormHtml = `
            <form id="checkAvailabilityForm">
                <h3>Check Item Availability</h3>
                <label for="itemName3">Enter Item Name:</label>
                <input type="text" id="itemName3" required>
                <button type="submit">Check Availability</button>
            </form>
        `;
        showForm(checkAvailabilityFormHtml);
    });

    // Event handler for "Read by Category" button
    
        // Show the Add Item form when the button is clicked
    
    $('#readByCategoryBtn').click(function() {
        const readByCategoryFormHtml = `
            <form id="readByCategoryForm">
                <h3>Read by Category</h3>
                <label for="categoryName">Enter Category Name:</label>
                <input type="text" id="categoryName" required>
                <button type="submit">Fetch Items</button>
            </form>
        `;
        showForm(readByCategoryFormHtml);
    });
});


$("#addItemForm").submit(function (e) {
    e.preventDefault();

    var name = $("#itemName").val();
    var price = parseInt($("#itemPrice").val(), 10); // Parse price as integer
    var quantity = parseInt($("#itemQuantity").val(), 10); // Parse quantity as integer
    var desc = $('#itemDesc').val();
    var categoryName = $("#itemCategory").val().toLowerCase(); // Ask for category name instead of categoryID
    var imageFile = $("#itemImage")[0].files[0]; // Get the image file from input

    // Check if all required fields are provided
    if (!name || isNaN(price) || isNaN(quantity) || !desc || !categoryName || !imageFile) {
        alert("Please fill all fields and upload an image.");
        return;
    }

    // Convert the image to Base64
    convertToBase64(imageFile).then(function(imageBase64) {
        // Step 1: Fetch all categories and find the categoryID based on category name
        $.ajax({
            url: `${categoryAPI}`, // Fetch all categories
            type: 'GET',
            success: function (categoryResponse) {
                if (categoryResponse.documents && categoryResponse.documents.length > 0) {
                    // Find the category ID from the category name
                    $("#addItemForm").hide();
                    const matchedCategory = categoryResponse.documents.find(doc => doc.fields.name.stringValue === categoryName);
                    
                    if (!matchedCategory) {
                        alert(`Category with name "${categoryName}" not found.`);

                        return;
                    }

                    const categoryID = matchedCategory.fields.category_id.integerValue; // Extract category_id

                    // Step 2: Fetch the current item_id from item_counter
                    $.ajax({
                        url: countersAPI + '/item_counter',
                        type: 'GET',
                        success: function (response) {
                            if (response.fields && response.fields.item_id) {
                                var currentItemId = parseInt(response.fields.item_id.integerValue); // Get the current item_id

                                // Increment item_id
                                var newItemId = currentItemId + 1;

                                // Step 3: Add the item to the inventory with the new item_id
                                $.ajax({
                                    url: inventoryAPI,
                                    type: 'POST',
                                    contentType: 'application/json',
                                    data: JSON.stringify({
                                        fields: {
                                            item_id: { integerValue: newItemId }, // Correctly formatted integer
                                            name: { stringValue: name }, // Correctly formatted string
                                            price: { integerValue: price }, // Correctly formatted integer
                                            quantity: { integerValue: quantity }, // Correctly formatted integer
                                            categoryID: { integerValue: categoryID }, // Fetched category ID from the category table
                                            desc: { stringValue: desc }, // Correctly formatted string
                                            availability: { booleanValue: quantity > 0 }, // Correctly formatted boolean
                                            image: { stringValue: imageBase64 } // Base64 image string
                                        }
                                    }),
                                    success: function () {
                                        alert("Item added to inventory with ID: " + newItemId);
                                        // Reload inventory or perform other UI updates here
                                        loadInventory();
                                        // Step 4: Update the item_counter with the new item_id
                                        $.ajax({
                                            url: countersAPI + '/item_counter',
                                            type: 'PATCH',
                                            contentType: 'application/json',
                                            data: JSON.stringify({
                                                fields: {
                                                    item_id: { integerValue: newItemId } // Update item_id in the counter
                                                }
                                            })
                                        });
                                    },
                                    error: function (xhr, status, error) {
                                        alert("Error adding item: " + xhr.responseText);
                                        console.error("Error details:", xhr, status, error);
                                    }
                                });
                            } else {
                                alert("Error: item_id is missing in item_counter document.");
                            }
                        },
                        error: function (xhr, status, error) {
                            alert("Error fetching item_id: " + xhr.responseText);
                            console.error("Error details:", xhr, status, error);
                        }
                    });
                } else {
                    alert("Error: No categories found.");
                }
            },
            error: function (xhr, status, error) {
                alert("Error fetching category data: " + xhr.responseText);
                console.error("Error details:", xhr, status, error);
            }
        });
    }).catch(function (error) {
        alert("Error converting image to Base64: " + error);
    });
});

// $("#addItemForm").submit(function (e) {
//     e.preventDefault();

//     var name = $("#itemName").val();
//     var price = parseInt($("#itemPrice").val(), 10); // Parse price as integer
//     var quantity = parseInt($("#itemQuantity").val(), 10); // Parse quantity as integer
//     var desc = $('#itemDesc').val();
//     var categoryID = parseInt($("#itemCategory").val(), 10); // Parse categoryID as integer
//     var imageFile = $("#itemImage")[0].files[0]; // Get the image file from input

//     // Check if all required fields are provided
//     if (!name || isNaN(price) || isNaN(quantity) || !desc || isNaN(categoryID) || !imageFile) {
//         alert("Please fill all fields and upload an image.");
//         return;
//     }

//     // Convert the image to Base64
//     convertToBase64(imageFile).then(function(imageBase64) {
//         // Fetch the current item_id from item_counter
//         $.ajax({
//             url: countersAPI + '/item_counter',
//             type: 'GET',
//             success: function (response) {
//                 if (response.fields && response.fields.item_id) {
//                     var currentItemId = parseInt(response.fields.item_id.integerValue); // Get the current item_id

//                     // Increment item_id
//                     var newItemId = currentItemId + 1;

//                     // Add the item to the inventory with the new item_id
//                     $.ajax({
//                         url: inventoryAPI,
//                         type: 'POST',
//                         contentType: 'application/json',
//                         data: JSON.stringify({
//                             fields: {
//                                 item_id: { integerValue: newItemId }, // Correctly formatted integer
//                                 name: { stringValue: name }, // Correctly formatted string
//                                 price: { integerValue: price }, // Correctly formatted integer
//                                 quantity: { integerValue: quantity }, // Correctly formatted integer
//                                 categoryID: { integerValue: categoryID }, // Correctly formatted integer
//                                 desc: { stringValue: desc }, // Correctly formatted string
//                                 availability: { booleanValue: quantity > 0 }, // Correctly formatted boolean
//                                 image: { stringValue: imageBase64 } // Base64 image string
//                             }
//                         }),
//                         success: function () {
//                             alert("Item added to inventory with ID: " + newItemId);
//                             // Reload inventory or perform other UI updates here
//                             loadInventory();
//                             // Update the item_counter with the new item_id
//                             $.ajax({
//                                 url: countersAPI + '/item_counter',
//                                 type: 'PATCH',
//                                 contentType: 'application/json',
//                                 data: JSON.stringify({
//                                     fields: {
//                                         item_id: { integerValue: newItemId } // Update item_id in the counter
//                                     }
//                                 })
//                             });
//                         },
//                         error: function (xhr, status, error) {
//                             alert("Error adding item: " + xhr.responseText);
//                             console.error("Error details:", xhr, status, error);
//                         }
//                     });
//                 } else {
//                     alert("Error: item_id is missing in item_counter document.");
//                 }
//             },
//             error: function (xhr, status, error) {
//                 alert("Error fetching item_id: " + xhr.responseText);
//                 console.error("Error details:", xhr, status, error);
//             }
//         });
//     }).catch(function (error) {
//         alert("Error converting image to Base64: " + error);
//     });
// });

// Function to convert the image file to a Base64 string
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result.split(',')[1]); // Return only the Base64 string without metadata
        };
        reader.onerror = () => {
            reject("Error converting file to Base64");
        };
        reader.readAsDataURL(file);
    });
}


let currentPage = 1;
const itemsPerPage = 3;
let allItems = []; // Array to store all fetched items

function loadInventory() {
    // Clear the existing inventory display
    $("#inventoryContainer").empty(); // Target the card container instead of table

    // Fetch all items from the inventory API
    $.ajax({
        url: inventoryAPI,
        type: 'GET',
        success: function (response) {
            allItems = response.documents; // Store all items globally
            updateTable(); // Update the table for the current page
        },
        error: function (error) {
            console.log("Error loading inventory: ", error);
            alert("Error loading inventory: " + error.message);
        }
    });
}

function updateTable() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToDisplay = allItems.slice(startIndex, endIndex); // Get the items to display for the current page

    // Clear the existing inventory display
    $("#inventoryContainer").empty();

    // Check if there are items to display
    if (itemsToDisplay.length === 0) {
        $("#inventoryContainer").append("<p>No items available.</p>");
        return;
    }

    // Loop through the items and append to the card container
    itemsToDisplay.forEach(function (item) {
        const itemData = item.fields; // Get fields from the item
        const itemId = itemData.item_id ? itemData.item_id.integerValue : "N/A";
        const categoryID = itemData.categoryID ? itemData.categoryID.integerValue : "N/A";
        const name = itemData.name ? itemData.name.stringValue : "N/A";
        const price = itemData.price ? itemData.price.integerValue : "N/A";
        const quantity = itemData.quantity ? itemData.quantity.integerValue : "N/A";
        const desc = itemData.desc ? itemData.desc.stringValue : "N/A";
        const availability = itemData.availability ? (itemData.availability.booleanValue ? 'Available' : 'Out of Stock') : 'Unknown';
        const image = itemData.image ? `data:image/png;base64,${itemData.image.stringValue}` : 'no-image.png'; // Check if image exists

        // Create a card for each item
        const card = `
        <div class="inventory-card">
            <img src="${image}" alt="Item Image" class="item-image">
            <div class="item-details">
                <h3>${name}</h3>
                <p>Price: $${price}</p>
                <p>Quantity: ${quantity}</p>
                <p>Category: ${categoryID}</p>
                <p>Description: ${desc}</p>
                <p>Status: ${availability}</p>
            </div>
        </div>`;

        $("#inventoryContainer").append(card); // Append the card to the container
    });

    // Update pagination controls
    const totalPages = Math.ceil(allItems.length / itemsPerPage);
    $("#pageInfo").text(`Page ${currentPage} of ${totalPages}`);
    $("#prevBtn").prop('disabled', currentPage === 1);
    $("#nextBtn").prop('disabled', currentPage >= totalPages);
}


// Event listener for the previous page button
$("#prevBtn").click(function () {
    if (currentPage > 1) {
        currentPage--;
        updateTable();
    }
});

// Event listener for the next page button
$("#nextBtn").click(function () {
    const totalPages = Math.ceil(allItems.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        updateTable();
    }
});

// Load inventory when the page loads
$(document).ready(function () {
    loadInventory();
});


$(document).ready(function () {
    // Load inventory when the page loads
    loadInventory();

    // Show/hide customer input section based on dropdown selection
    $("#crudSelect").change(function () {
        const operation = $(this).val();
        $("#customerInputSection").show();
        $("#customerDetails").hide();
        $("#creditScoreForm").hide();
    
        if (operation) {
            $("#customerInputSection").show();
        } else {
            $("#customerInputSection").hide();
        }
    });
    
    // Fetch customer details based on entered customer name
    $("#fetchCustomerBtn").click(function (e) {
        e.preventDefault();
        const customerName = $("#customerName").val();
    
        // Replace with your Firestore API endpoint and query by name
        $.ajax({
            url: `https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents:runQuery`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                structuredQuery: {
                    from: [{ collectionId: 'customer' }],
                    where: {
                        fieldFilter: {
                            field: { fieldPath: 'name' },
                            op: 'EQUAL',
                            value: { stringValue: customerName }
                        }
                    }
                }
            }),
            success: function (response) {
                // Check if a matching customer was found
                if (response.length && response[0].document) {
                    const customerDoc = response[0].document;
                    const customerDocId = customerDoc.name.split('/').pop();
                    const customerCreditScore = customerDoc.fields.credit_score.integerValue;
    
                    // Display customer information
                    $("#customerInfo").text(`Name: ${customerName}, Credit Score: ${customerCreditScore}`);
                    $("#customerDetails").show();
                    $("#creditScoreForm").show();
    
                    // Store the document ID for later use in updates
                    $("#customerDocId").val(customerDocId);
                } else {
                    alert("Customer not found!");
                }
            },
            error: function (error) {
                console.log("Error fetching customer details: ", error);
                alert("Error fetching customer details: " + error.message);
            }
        });
    });
    
    // Handle the submission of credit score operations-------------------------------------------------------------
    $("#crudSubmit").click(function (e) {
        e.preventDefault();
        const customerDocId = $("#customerDocId").val();
        const creditScore = $("#creditScore").val();
        const operation = $("#crudSelect").val();
    
        if (!customerDocId) {
            alert("Customer not found. Please fetch customer details first.");
            return;
        }
    
        switch (operation) {
            case 'addCreditScore':
            case 'updateCreditScore':
                // For both adding and updating credit score, use PATCH to update the credit_score field
                $.ajax({
                    url: `https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/customer/${customerDocId}?updateMask.fieldPaths=credit_score`,
                    type: 'PATCH',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        fields: {
                            credit_score: { integerValue: parseInt(creditScore, 10) }
                        }
                    }),
                    success: function () {
                        alert("Credit score updated successfully!");
                    },
                    error: function (error) {
                        console.log("Error updating credit score: ", error);
                        alert("Error updating credit score: " + error.message);
                    }
                });
                break;
    
            case 'deleteCreditScore':
                // To delete the credit score, PATCH with a null value for credit_score
                $.ajax({
                    url: `https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/customer/${customerDocId}?updateMask.fieldPaths=credit_score`,
                    type: 'PATCH',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        fields: {
                            credit_score: { nullValue: null }  // Remove the credit score field
                        }
                    }),
                    success: function () {
                        alert("Credit score deleted successfully!");
                    },
                    error: function (error) {
                        console.log("Error deleting credit score: ", error);
                        alert("Error deleting credit score: " + error.message);
                    }
                });
                break;
        }
    });
});    

//credit score crud
$(document).ready(function () {
    let currentCustomerPage = 1;
    const customersPerPage = 10;
    let totalCustomers = 0;

    // Fetch customers when the button is clicked
    $("#fetchCustomersBtn").click(function () {
        currentCustomerPage = 1;
        loadCustomers(currentCustomerPage);
        $("#customerList").show();
    });

    // Function to load customers
    function loadCustomers(page) {
        $.ajax({
            url: `https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/customer`,
            type: 'GET',
            success: function (response) {
                const customers = response.documents;
                totalCustomers = response.total; // Assuming you have total count in response
                // displayCustomers(customers);
                // updateCustomerPagination();
            },
            error: function (error) {
                console.log("Error fetching customers: ", error);
                alert("Error fetching customers: " + error.message);
            }
        });
    }

//fetch, update credit score, reset credit score
$(document).ready(function () {
    const customerAPI = "https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/customer";
    let currentPage = 1;
    const pageSize = 5; // Adjust the page size as needed
    let totalPages = 1;
    let customers = [];

    // Fetch customers on button click
    $("#fetchCustomersBtn").click(function () {
        fetchCustomers(currentPage);
    });

    // Fetch customers function with pagination
    function fetchCustomers(page) {
        $.ajax({
            url: customerAPI,
            type: 'GET',
            success: function (response) {
                customers = response.documents;
                totalPages = Math.ceil(customers.length / pageSize);
                displayCustomers(page);
            },
            error: function (error) {
                console.log("Error fetching customer data: ", error);
                alert("Error fetching customer data.");
            }
        });
    }

    // Display customers for the current page
    function displayCustomers(page) {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const customerSubset = customers.slice(start, end);
        const customerList = $("#customers");
        customerList.empty();

        // Loop to display each customer
        for (let i = 0; i < customerSubset.length; i++) {
            const customer = customerSubset[i];
            const customerData = customer.fields;
            const name = customerData.name.stringValue;
            const email = customerData.email.stringValue;
            const creditScore = customerData.credit_score ? customerData.credit_score.integerValue : 0;
            const phoneNumber = customerData.phone_number ? customerData.phone_number.stringValue : "N/A"; // Example of another field

            // Display customer info
            customerList.append(`
                <div class="customerRecord">
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone Number:</strong> ${phoneNumber}</p>
                    <p><strong>Credit Score:</strong> ${creditScore}</p>
                </div>
                <hr>
            `);
        }

        // Show pagination controls
        updatePaginationControls(page);

        // Show customer list and buttons
        $("#customerList").show();
    }

    // Update pagination controls
    function updatePaginationControls(page) {
        currentPage = page;

        // Disable the "Previous" button on the first page
        $("#prevCustomerBtn").prop("disabled", currentPage === 1);
        // Disable the "Next" button on the last page
        $("#nextCustomerBtn").prop("disabled", currentPage === totalPages);

        // Update page indicator
        $("#customerPageIndicator").text(`Page ${currentPage}`);
    }

    // Handle pagination
    $("#prevCustomerBtn").click(function () {
        if (currentPage > 1) {
            displayCustomers(currentPage - 1);
        }
    });

    $("#nextCustomerBtn").click(function () {
        if (currentPage < totalPages) {
            displayCustomers(currentPage + 1);
        }
    });

    // Handle update credit score button click (for all records)
            $("#updateCreditBtn").click(function () {
                const updateCreditFormHtml = `
            <form id="updateCreditForm">
                <label for="userName">Enter User Name to Update Credit Score:</label>
                <input type="text" id="userName" name="userName" required><br><br>
                <button type="submit">Update Credit Score</button>
            </form>
        `;
        $('#formContainer').html(updateCreditFormHtml);

        $('#updateCreditForm').submit(function (event) {
            event.preventDefault();
            const userName = $('#userName').val().toLowerCase();
            if (userName) {
                updateCreditScore(userName);
            } else {
                alert("User name cannot be empty.");
            }
        });
    });

    // Handle reset credit score button click (for all records)
    $("#resetCreditBtn").click(function () {
        const resetCreditFormHtml = `
        <form id="resetCreditForm">
            <label for="userName">Enter User Name to Reset Credit Score:</label>
            <input type="text" id="userName" name="userName" required><br><br>
            <button type="submit">Reset Credit Score</button>
        </form>
    `;
    $('#formContainer').html(resetCreditFormHtml);

    $('#resetCreditForm').submit(function (event) {
        event.preventDefault();
        const userName = $('#userName').val().trim();
        if (userName) {
            resetCreditScore(userName);
        } else {
            alert("User name cannot be empty.");
        }
    });

    });

    // Function to update the credit score for a user by name
    function updateCreditScore(userName) {
        // Fetch all customers from the customer table
        $.ajax({
            url: usersAPI, // API for customer table
            type: 'GET',
            success: function (response) {
                const customers = response.documents; // Get all customers from the API response
                let customerFound = false; // Flag to check if the user is found
    
                // Loop through each customer to find a match by name
                for (let i = 0; i < customers.length; i++) {
                    const customer = customers[i];
                    const customerData = customer.fields;
    
                    // Match customer name, case-insensitive comparison
                    if (customerData.name.stringValue.trim().toLowerCase() === userName.trim().toLowerCase()) {
                        customerFound = true; // Set flag when user is found
                        const customerId = customer.name.split('/').pop(); // Extract document ID
    
                        // Ask for the new credit score
                        const updateCreditScoreFormHtml = `
        <form id="updateCreditScoreForm">
            <label for="newCreditScore">Enter the new credit score for ${userName}:</label>
            <input type="number" id="newCreditScore" name="newCreditScore" required min="0><br><br>
            <button type="submit">Update Credit Score</button>
            <button type="button" id="cancelUpdate">Cancel</button>
        </form>
    `;
    $('#formContainer').html(updateCreditScoreFormHtml);

    // Handle form submission
    $('#updateCreditScoreForm').submit(function (event) {
        event.preventDefault(); // Prevent default form submission
        const newCreditScore = $('#newCreditScore').val().trim();

        if (newCreditScore && parseInt(newCreditScore, 10) >= 0) {
            // Call your function to update the credit score
            $('#formContainer').hide();
            updateCreditScore(userName, newCreditScore);
        } else {
            alert("Please enter a valid credit score.");
        }
    
                        
                        // Ensure the new credit score is valid
                        if (newCreditScore && parseInt(newCreditScore, 10) > 0) {
                            // Fetch the existing customer data before updating the credit score
                            $.ajax({
                                url: `${usersAPI}/${customerId}`,
                                type: 'GET',
                                success: function (existingData) {
                                    const existingFields = existingData.fields;
    
                                    // Only update the credit_score field while preserving other fields using an update mask
                                    const updatedFields = {
                                        credit_score: { integerValue: parseInt(newCreditScore, 10) }
                                    };
    
                                    // Perform PATCH request to update only the credit_score field
                                    $.ajax({
                                        url: `${usersAPI}/${customerId}?updateMask.fieldPaths=credit_score`,
                                        type: 'PATCH',
                                        contentType: "application/json",
                                        data: JSON.stringify({ fields: updatedFields }),
                                        success: function () {
                                            alert("Credit score updated successfully!");
                                            fetchCustomers(currentPage); // Refresh the customer list
                                        },
                                        error: function (error) {
                                            console.log("Error updating credit score: ", error);
                                            alert("Error updating credit score: " + error.message);
                                        }
                                    });
                                },
                                error: function (error) {
                                    console.log("Error fetching customer data: ", error);
                                    alert("Error fetching customer data.");
                                }
                            });
                        } else {
                            alert("Please enter a valid credit score greater than 0.");
                        }
                    });
                        break; // Exit the loop once the user is found
                    }
                }
    
                // If the customer was not found after the loop
                if (!customerFound) {
                    alert("No user found with the entered name.");
                }
            },
            error: function (error) {
                console.log("Error fetching customer data: ", error);
                alert("Error fetching customer data.");
            }
        });
    }
    
    
    

    // Function to reset the credit score for a user by name
    function resetCreditScore(userName) {
        // Fetch all customers from the customer table
        $.ajax({
            url: usersAPI, // API for customer table
            type: 'GET',
            success: function (response) {
                const customers = response.documents; // Get all customers from the API response
                let customerFound = false; // Flag to check if the user is found
    
                // Loop through each customer to find a match by name
                for (let i = 0; i < customers.length; i++) {
                    const customer = customers[i];
                    const customerData = customer.fields;
    
                    // Match customer name, case-insensitive comparison
                    if (customerData.name.stringValue.trim().toLowerCase() === userName.trim().toLowerCase()) {
                        customerFound = true; // Set flag when user is found
                        const customerId = customer.name.split('/').pop(); // Extract document ID
    
                        // Fetch the existing customer data before resetting the credit score
                        $.ajax({
                            url: `${usersAPI}/${customerId}`,
                            type: 'GET',
                            success: function (existingData) {
                                const existingFields = existingData.fields;
    
                                // Only reset the credit_score while preserving other fields using an update mask
                                const updatedFields = {
                                    credit_score: { integerValue: 0 }
                                };
    
                                // Perform PATCH request to update only the credit_score field
                                $.ajax({
                                    url: `${usersAPI}/${customerId}?updateMask.fieldPaths=credit_score`,
                                    type: 'PATCH',
                                    contentType: "application/json",
                                    data: JSON.stringify({ fields: updatedFields }),
                                    success: function () {
                                        alert("Credit score reset successfully!");
                                        fetchCustomers(currentPage); // Refresh the customer list
                                    },
                                    error: function (error) {
                                        console.log("Error resetting credit score: ", error);
                                        alert("Error resetting credit score: " + error.message);
                                    }
                                });
                            },
                            error: function (error) {
                                console.log("Error fetching customer data: ", error);
                                alert("Error fetching customer data.");
                            }
                        });
                        break; // Exit the loop once the user is found
                    }
                }
    
                // If the customer was not found after the loop
                if (!customerFound) {
                    alert("No user found with the entered name.");
                }
            },
            error: function (error) {
                console.log("Error fetching customer data: ", error);
                alert("Error fetching customer data.");
            }
        });
    }
    
    
});


    // Call the function to initially load customers
    loadCustomers(currentCustomerPage);

    // Load products for customer
    function loadProducts() {
        $.ajax({
            url: inventoryAPI, // Ensure `inventoryAPI` is defined somewhere in your code
            type: 'GET',
            success: function (response) {
                let html = "";
                const items = response.documents;

                items.forEach(function (doc) {
                    const data = doc.fields;
                    html += `
                        <div>
                            <h3>${data.name.stringValue}</h3>
                            <p>Price: $${data.price.integerValue}</p>
                            <p>Available: ${data.quantity.integerValue}</p>
                            <button class="addToCart" data-id="${doc.name.split('/').pop()}">Add to Cart</button>
                        </div>
                    `;
                });

                $("#productList").html(html);
            },
            error: function (error) {
                console.log("Error loading products: ", error);
            }
        });
    }
});

//updating inventory items
$(document).ready(function () {
    const inventoryAPI = "https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/inventory";

    // Show the update form when the button is clicked
    $("#updateItemBtn").click(function () {
        $("#updateItemForm").toggle();
    });

    // Handle update item button click
    $("#submitUpdateBtn").click(function () {
        const itemName = $("#itemName2").val().toLowerCase();
        const itemPrice = $("#itemPrice2").val();
        const itemQuantity = $("#itemQuantity2").val();
        const itemDesc = $("#itemDesc2").val();

        if (itemName) {
            // Step 1: Fetch inventory items from Firestore
            $.ajax({
                url: inventoryAPI,
                type: 'GET',
                success: function (response) {
                    const items = response.documents;
                    let itemExists = false;
                    console.log(items);
                    // Step 2: Use for loop to check if the item exists by matching the name
                    for (let i = 0; i < items.length; i++) {
                        const item = items[i];
                        const itemData = item.fields;

                        if (itemData.name.stringValue.toLowerCase() === itemName) {
                            itemExists = true;
                            const itemDocId = item.name.split('/').pop(); // Extract the item ID from document path

                            // Step 3: Fetch existing item data to keep other fields unchanged
                            $.ajax({
                                url: `${inventoryAPI}/${itemDocId}`,
                                type: 'GET',
                                success: function (existingData) {
                                    // Step 4: Prepare updated fields
                                    const updatedFields = { ...existingData.fields };

                                    // Only update filled fields
                                    if (itemPrice) {
                                        updatedFields.price = { integerValue: parseInt(itemPrice, 10) };
                                    }
                                    if (itemQuantity) {
                                        updatedFields.quantity = { integerValue: parseInt(itemQuantity, 10) };
                                    }
                                    if (itemDesc) {
                                        updatedFields.desc = { stringValue: itemDesc };
                                    }

                                    // Step 5: Update the item fields in Firestore
                                    $.ajax({
                                        url: `${inventoryAPI}/${itemDocId}`,
                                        type: 'PATCH',
                                        contentType: 'application/json',
                                        data: JSON.stringify({
                                            fields: updatedFields
                                        }),
                                        success: function () {
                                            alert("Item updated successfully!");
                                        },
                                        error: function (error) {
                                            console.log("Error updating item: ", error);
                                            alert("Error updating item: " + error.message);
                                        }
                                    });
                                },
                                error: function (error) {
                                    console.log("Error fetching existing item data: ", error);
                                    alert("Error fetching item data.");
                                }
                            });

                            
                        }
                        if (!itemExists) {
                            alert("No item found with the entered name.");
                            // Break out of the loop as soon as the item is found
                            break;
                        }
                    }

                    // Step 6: Handle case where no item was found
                    
                },
                error: function (error) {
                    console.log("Error fetching items: ", error);
                    alert("Error fetching items: " + error.message);
                }
            });
        } else {
            alert("Please enter an item name.");
        }
    });
});


//enable or disable product
$(document).ready(function () {
    const inventoryAPI = "https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/inventory";

    // Show form when "Check Item Availability" is clicked
    $("#checkAvailabilityBtn").click(function () {
        $("#checkAvailabilityForm").toggle(); // Toggle visibility of the form
    });

    // Handle form submission
    $("#checkAvailabilityForm").submit(function (event) {
        event.preventDefault(); // Prevent the form from reloading the page
        
        // Trim the input value to avoid any leading/trailing spaces
        const itemName = $('#itemName3').val().toLowerCase(); // Get the entered item name
        $('#checkAvailabilityForm').hide();
        console.log("Entered Item Name:", itemName); // Debugging log

        if (itemName) {
            // Step 1: Fetch the inventory item by name
            $.ajax({
                url: inventoryAPI,
                type: 'GET',
                success: function (response) {
                    const items = response.documents;
                    let itemFound = false;

                    // Step 2: Find the item by name using a for loop to enable break statement
                    for (let i = 0; i < items.length; i++) {
                        const item = items[i];
                        const itemData = item.fields;

                        // Debugging log to check the item name in the inventory
                        const currentItemName = itemData.name.stringValue.toLowerCase();
                        console.log(`Checking Item: ${currentItemName}`); // Debugging log

                        if (currentItemName === itemName) {
                            itemFound = true;
                            const availability = itemData.availability && itemData.availability.booleanValue ? 'Available' : 'Out of Stock';
                            const itemDocId = item.name.split('/').pop(); // Extract item ID from document path

                            // Step 3: Show current availability
                            $("#currentAvailability").text(availability);
                            $("#updateAvailabilityForm").show();

                            // Handle the submit button click to update availability
                            $("#submitAvailabilityBtn").off("click").on("click", function () { // Use off() to avoid multiple bindings
                                const selectedAvailability = $("#availabilityStatus").val() === 'true';

                                // Step 4: Fetch existing item data to preserve other fields
                                $.ajax({
                                    url: `${inventoryAPI}/${itemDocId}`,
                                    type: 'GET',
                                    success: function (existingData) {
                                        const existingFields = existingData.fields;

                                        // Step 5: Update only the availability field while keeping other fields unchanged
                                        const updatedFields = {
                                            ...existingFields, // Spread existing fields to preserve them
                                            availability: { booleanValue: selectedAvailability } // Update only the availability field
                                        };

                                        // Step 6: Send the updated data back to Firestore
                                        $.ajax({
                                            url: `${inventoryAPI}/${itemDocId}`,
                                            type: 'PATCH',
                                            contentType: 'application/json',
                                            data: JSON.stringify({
                                                fields: updatedFields
                                            }),
                                            success: function () {
                                                alert("Item availability updated successfully!");
                                                $("#updateAvailabilityForm").hide();

                                            },
                                            error: function (error) {
                                                console.log("Error updating availability: ", error);
                                                alert("Error updating availability.");
                                            }
                                        });
                                    },
                                    error: function (error) {
                                        console.log("Error fetching item data: ", error);
                                        alert("Error fetching item data.");
                                    }
                                });
                            });
                            break; // Break out of the loop once the item is found
                        }
                    }

                    // Step 7: Handle case where item was not found
                    if (!itemFound) {
                        alert("Item not found.");
                    }
                },
                error: function (error) {
                    console.log("Error fetching inventory items: ", error);
                    alert("Error fetching inventory items.");
                }
            });
        } else {
            alert("Please enter an item name.");
        }
    });
});

//read by category

// Function to fetch the category ID based on the entered category name
async function fetchCategoryID(categoryName) {
    try {
        $('readByCategoryForm').hide();

        const response = await fetch('https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/category');
        const data = await response.json();

        // Check if the response has valid data
        if (data.documents && data.documents.length > 0) {
            const category = data.documents.find(doc => {
                return doc.fields.name.stringValue === categoryName;
            });
            if (category) {
                const categoryId = category.fields.category_id.integerValue;
            // console.log(categoryId);

                return categoryId;
            } else {
                console.error('Category not found');
                alert('Category not found');
                return null;
            }
        } else {
            console.error('No categories found in the response');
            alert('No categories found');
            return null;
        }
    } catch (error) {
        console.error('Error fetching category:', error);
    }
}

// Function to fetch inventory items based on category ID
// Function to fetch inventory items by iterating through the Firestore inventory collection

async function fetchInventoryByCategory(categoryId, pageNumber = 1, itemsPerPage = 5) {
    try {
        // Step 1: Fetch the inventory items from the inventory table
        const inventoryAPI = 'https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/inventory';
        const inventoryResponse = await fetch(inventoryAPI);
        const inventoryData = await inventoryResponse.json();

        // Check if the inventory data is valid
        if (inventoryData.documents && inventoryData.documents.length > 0) {
            // Step 2: Filter inventory items by the categoryId
            const matchingItems = inventoryData.documents.filter(doc => {
                return doc.fields.categoryID && doc.fields.categoryID.integerValue === categoryId;
            });
            console.log(matchingItems);
            if (matchingItems.length > 0) {
                // Step 3: Paginate the results
                const paginatedItems = matchingItems.slice((pageNumber - 1) * itemsPerPage, pageNumber * itemsPerPage);

                // Step 4: Display the paginated items
                displayInventoryItems(paginatedItems);
            } else {
                console.error('No items found for the selected category');
                alert('No items found for the selected category');
            }
        } else {
            console.error('No inventory found');
            alert('No inventory found');
        }
    } catch (error) {
        console.error('Error fetching inventory:', error);
        alert('Error fetching inventory');
    }
}


function displayInventoryItems(items) {
    const inventoryContainer = document.getElementById('categoryInventoryContainer');
    inventoryContainer.innerHTML = ''; // Clear previous content

    items.forEach(item => {
        const fields = item.fields;
        const itemCard = document.createElement('div');
        itemCard.className = 'inventory-card';
    
        // Handle Base64 image encoding or fallback to a placeholder image
        const imageUrl = fields.image && fields.image.stringValue 
            ? `data:image/png;base64,${fields.image.stringValue}` 
            : 'data:image/png;base64,PLACEHOLDER_BASE64_IMAGE_HERE'; // Use a placeholder Base64 string or URL
    
        const imageElement = `<img class="item-image" src="${imageUrl}" alt="${fields.name ? fields.name.stringValue : 'No Name Available'}">`;
    
        // Handle missing fields gracefully
        const itemName = fields.name ? fields.name.stringValue : 'No Name Available';
        const itemPrice = fields.price ? `$${fields.price.integerValue}` : 'Price Unavailable';
        const itemQuantity = fields.quantity ? `Quantity: ${fields.quantity.integerValue}` : 'Quantity Unavailable';
        const itemDesc = fields.desc ? fields.desc.stringValue : 'No Description Available';
    
        // Build the card content with the item details
        itemCard.innerHTML = `
            ${imageElement}
            <div class="item-details">
                <h3>${itemName}</h3>
                <p>${itemPrice}</p>
                <p>${itemQuantity}</p>
                <p>${itemDesc}</p>
            </div>
        `;
    
        // Append the constructed item card to the inventory container
        inventoryContainer.appendChild(itemCard);
    });
    
}
$(document).ready(function () {
    // Event listener for 'Read by Category' button
    $('#readByCategoryBtn').click(function () {
        // If the form exists, toggle its visibility
        if ($("#readByCategoryForm").length) {
            $("#readByCategoryForm").toggle();
        } else {
            // Otherwise, create the form dynamically
            const readByCategoryFormHtml = `
            <form id="readByCategoryForm">
                <label for="categoryName">Enter Category Name:</label>
                <input type="text" id="categoryName" name="categoryName" required><br><br>
                <button type="submit">Fetch Items</button>
            </form>
            `;
            $('#categoryContainer').html(readByCategoryFormHtml);
        }

        // Event listener for form submission
        $('#categoryContainer').on('submit', '#readByCategoryForm', async function (event) {
            event.preventDefault();
            $('#readByCategoryForm').hide(); // Hide the form after submission
            const categoryName = $('#categoryName').val().toLowerCase();
            if (categoryName) {
                const categoryId = await fetchCategoryID(categoryName); // Assuming fetchCategoryID fetches ID
                if (categoryId) {
                    console.log(categoryId);
                    fetchInventoryByCategory(categoryId, 1, 2); // Fetch the items in that category
                }
            }
        });
    });
});


//inventory search for admin
let availableItems = []; // This should be declared globally to store available items

// Handle search bar input
$('#searchBar').on('input', function () {
    const searchTerm = $(this).val().toLowerCase();
    
    // Fetch available items only if search term is not empty
    if (searchTerm.length > 0) {
        fetchAvailableItems();
    }

    const filteredItems = availableItems.filter(item => {
        const name = item.fields.name.stringValue.toLowerCase();
        return name.includes(searchTerm);
    });

    // Sort the filtered items to show matches at the top (if needed)
    filteredItems.sort((a, b) => {
        return a.fields.name.stringValue.toLowerCase().indexOf(searchTerm) -
               b.fields.name.stringValue.toLowerCase().indexOf(searchTerm);
    });

    // Display filtered and sorted items
    displayItems(filteredItems);
});

function fetchAvailableItems() {
    $.ajax({
        url: inventoryAPI, // Use your existing inventoryAPI
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            // Filter only available items and store them globally
            availableItems = data.documents.filter(item => item.fields.availability.booleanValue);
            // No need to display items initially
        },
        error: function (error) {
            console.error('Error fetching items:', error);
            alert('Error fetching items.');
        }
    });
}

// Display items as cards
function displayItems(items) {
    const itemsHtml = items.map(item => {
        const itemId = item.fields.item_id.integerValue;
        const itemName = item.fields.name.stringValue;
        const description = item.fields.desc ? item.fields.desc.stringValue : 'No description available';
        const price = item.fields.price.doubleValue || item.fields.price.integerValue;
        const quantityAvailable = item.fields.quantity.integerValue;
        const imageUrl = `data:image/png;base64,${item.fields.image.stringValue}`; // Image URL or Base64

        return `
            <div class="card">
                <img src="${imageUrl}" alt="${itemName}">
                <h4>${itemName}</h4>
                <p>${description}</p>
                <p>Price: $${price}</p>
                <p>Available: ${quantityAvailable}</p>
            </div>
        `;
    }).join('');

    // Update the items container; show message if no items found
    if (items.length === 0) {
        $('#itemsContainer').html('<p>No items found.</p>');
    } else {
        $('#itemsContainer').html(itemsHtml);
    }
}


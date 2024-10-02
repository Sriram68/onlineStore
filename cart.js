const cartAPI = "https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/cart";
const inventoryAPI = "https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/inventory";
const customerAPI = "https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/customer";
const orderHistoryAPI = "https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/order_history";

// Global variables

let cartItems = [];
let grandTotal = 0;
let customerEmail = sessionStorage.getItem("customer_email"); // Get logged-in customer email
let customerCreditScore = 0;

const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

// Load theme from localStorage if available
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
    body.classList.add('dark-mode');
    darkModeToggle.innerHTML = '☀️'; // Set to sun icon
}

darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        darkModeToggle.innerHTML = '☀️'; // Sun icon for light mode toggle
    } else {
        localStorage.setItem('theme', 'light');
        darkModeToggle.innerHTML = '🌙'; // Moon icon for dark mode toggle
    }
});

// Load Cart Items when the page is loaded
$(document).ready(function () {
    if (customerEmail) {
        fetchCustomerCreditScore();
        loadCartItems();
    } else {
        alert("No customer email found. Please login.");
        window.location.href = "login.html"; // Redirect to login if no email
    }
});

// Fetch all customers and match credit score with session email
// Fetch all customers and match credit score with session email
function fetchCustomerCreditScore() {
    $.ajax({
        url: customerAPI, // Get all customer records
        type: 'GET',
        success: function (response) {

            // Assuming the documents are inside response.documents, but we will confirm by logging the response
            if (response.documents) {
                const customers = response.documents;
                const matchingCustomer = customers.find(c => c.fields.email.stringValue === customerEmail);

                if (matchingCustomer) {
                    customerCreditScore = matchingCustomer.fields.credit_score.integerValue;
                    $('#creditScore').text(`Credit Score: ${customerCreditScore}`);

                    // Enable the Buy with Credit Score button if credit score >= 1000
                    if (customerCreditScore >= 1000) {
                        $('#buyCreditBtn').prop('disabled', false);
                    }
                } else {
                    console.error('No matching customer found with the given email.');
                }
            } else {
                console.error('Documents field is missing in the API response.');
            }
        },
        error: function (error) {
            console.error("Error fetching customer details:", error);
        }
    });
}


// Load Cart Items from the cart table and render them
function loadCartItems() {
    $.ajax({
        url: `${cartAPI}/${customerEmail}`, // Fetch items from cart using customer email as document ID
        type: 'GET',
        success: function (response) {
            cartItems = response.fields.items.arrayValue.values;
            renderCartItems();
        },
        error
:
function
(error) {            
if
(error.status === 404) {                
// Cart not found, likely because it doesn't exist
                $(
'#cartContainer'
).
html
(
'<p>Your cart is empty.</p>'
); 
$('#grandTotal').html(`$<span> 0</span>`);
            }
else
{                 console.
error
(
'Error fetching cart items:'
, error);
alert
(
'An error occurred while fetching cart items.'
); } }
    });
}

// Render Cart Items in the Cart Page
// function renderCartItems() {
//     const cartContainer = $('#cartContainer');
//     cartContainer.empty();
//     grandTotal = 0;

//     // Log cart items to ensure they are being populated
//     console.log("Cart Items: ", cartItems);
//     // if (cartItems.length <= 0){
//     //     $('#buyCashBtn').prop('disabled', true);
//     //     $('#buyCreditBtn').prop('disabled', true);
//     // }

//     // Fetch all inventory items first
//     $.ajax({
//         url: inventoryAPI, // Fetch all inventory items
//         type: 'GET',
//         success: function (inventoryResponse) {
//             const inventoryItems = inventoryResponse.documents;
            
//             // Log inventory items to ensure they are fetched correctly
//             console.log("Inventory Items: ", inventoryItems);

//             // Loop through cart items and match with inventory items
//             cartItems.forEach(item => {
//                 // Accessing itemId and quantity correctly
//                 const itemId = item.mapValue.fields.itemId.stringValue; // itemId as string
//                 const quantity = item.mapValue.fields.quantity.integerValue; // quantity as integer

//                 // Log itemId and quantity for debugging
//                 console.log("Processing cart item with itemId: ", itemId, " and quantity: ", quantity);

//                 // Parse itemId to integer for comparison
//                 const parsedItemId = parseInt(itemId, 10);

//                 // Find matching inventory item using parsedItemId
//                 const inventoryItem = inventoryItems.find(i => i.fields.item_id.integerValue == parsedItemId); // Compare as integer

//                 if (inventoryItem) {
//                     const itemName = inventoryItem.fields.name.stringValue;
//                     const price = inventoryItem.fields.price.integerValue;
//                     const availableQuantity = inventoryItem.fields.quantity.integerValue;
//                     const itemImage = `data:image/png;base64,${inventoryItem.fields.image.stringValue}`;
//                     if (availableQuantity <= 0){
//                         $('#buyCashBtn').prop('disabled', true);
//                         $('#buyCreditBtn').prop('disabled', true);
//                     }
//                     grandTotal += price * quantity;

//                     // Log the matched inventory item details
//                     console.log("Matched Inventory Item: ", inventoryItem);

//                     // Render cart item as a card
//                     const card = `
//                         <div class="cart-card">
//                             <img src="${itemImage}" alt="${itemName}">
//                             <h3>${itemName}</h3>
//                             <p>${inventoryItem.fields.desc.stringValue}</p>
//                             <p>Price: $${price}</p>
//                             <p>Available: ${availableQuantity}</p>
//                             <div class="quantity-container">
//                                 <button class="decrement" data-id="${parsedItemId}">-</button>
//                                 <input type="text" class="quantity" value="${quantity}" min="1" max="${availableQuantity}" readonly>
//                                 <button class="increment" data-id="${parsedItemId}">+</button>
//                             </div>
//                             <button onclick="deleteCartItem('${itemId}')">Delete</button>
//                         </div>
//                     `;
//                     cartContainer.append(card); // Append the card to the container
//                 } else {
//                     console.log(`No matching inventory item or item not available for itemId: ${itemId}`);
//                 }
//             });

//             // Update grand total
//             $('#grandTotal').text(`$${grandTotal}`);
//         },
//         error: function (error) {
//             console.error("Error fetching inventory items:", error);
//         }
//     });
// }

function renderCartItems() {
    const cartContainer = $('#cartContainer');
    cartContainer.empty();
    grandTotal = 0;

    // Fetch cart items from the backend
    $.ajax({
        url: `${cartAPI}/${customerEmail}`, // Ensure that cartItems are fetched properly
        method: 'GET',
        dataType: 'json',
        success: function (cartResponse) {
            const cartItems = cartResponse.fields.items.arrayValue.values || [];

            // Log cart items to ensure they are being populated
            console.log("Cart Items: ", cartItems);

            // Check if cart is empty and disable buttons if true
            if (cartItems.length === 0) {
                $('#buyCashBtn').prop('disabled', true);
                $('#buyCreditBtn').prop('disabled', true);
                // $('#grandTotal').text(`$0`);
                cartContainer.append('<p>Your cart is empty.</p>');
                return; // No need to proceed further if the cart is empty
            }

            // Fetch all inventory items to match with cart items
            $.ajax({
                url: inventoryAPI, // Fetch all inventory items
                type: 'GET',
                success: function (inventoryResponse) {
                    const inventoryItems = inventoryResponse.documents;

                    // Log inventory items to ensure they are fetched correctly
                    console.log("Inventory Items: ", inventoryItems);

                    // Loop through cart items and match with inventory items
                    cartItems.forEach(item => {
                        // Accessing itemId and quantity correctly
                        const itemId = item.mapValue.fields.itemId.stringValue; // itemId as string
                        const quantity = item.mapValue.fields.quantity.integerValue; // quantity as integer

                        // Log itemId and quantity for debugging
                        console.log("Processing cart item with itemId: ", itemId, " and quantity: ", quantity);

                        // Parse itemId to integer for comparison
                        const parsedItemId = parseInt(itemId, 10);

                        // Find matching inventory item using parsedItemId
                        const inventoryItem = inventoryItems.find(i => i.fields.item_id.integerValue == parsedItemId); // Compare as integer

                        if (inventoryItem) {
                            const itemName = inventoryItem.fields.name.stringValue;
                            const price = inventoryItem.fields.price.integerValue;
                            const availableQuantity = inventoryItem.fields.quantity.integerValue;
                            const itemImage = `data:image/png;base64,${inventoryItem.fields.image.stringValue}`;
                            const availability = inventoryItem.fields.availability.booleanValue;

                            // Disable the "Buy" buttons if any item is out of stock
                            if (availableQuantity <= 0 || !availability) {
                                $('#buyCashBtn').prop('disabled', true);
                                $('#buyCreditBtn').prop('disabled', true);
                            }

                            grandTotal += price * quantity;

                            // Log the matched inventory item details
                            console.log("Matched Inventory Item: ", inventoryItem);

                            // Render cart item as a card
                            let availabilityMessage = `<p>Available: ${availableQuantity}</p>`; // Default message
                    let availabilityStyle = ''; // Default style for normal availability

                    if (!availability) {
                        availabilityMessage = `<p style="color:red;">Item Not Available</p>`; // If item is unavailable
                    } else if (availableQuantity <= 0) {
                        availabilityMessage = `<p style="color:red;">Out of Stock!</p>`; // If item is out of stock
                    }

                        let quantityContainer = `
                                <div class="quantity-container">
                                    <button class="decrement" data-id="${parsedItemId}" ${(!availability || availableQuantity <= 0) ? 'disabled' : ''}>-</button>
                                    <input type="text" class="quantity" value="${quantity}" min="1" max="${availableQuantity}" readonly ${(!availability || availableQuantity <= 0) ? 'disabled' : ''}>
                                    <button class="increment" data-id="${parsedItemId}" ${(!availability || availableQuantity <= 0) ? 'disabled' : ''}>+</button>
                                </div>
                            `;

                            // Render cart item as a card with availability message and quantity container
                            const card = `
                                <div class="cart-card">
                                    <img src="${itemImage}" alt="${itemName}">
                                    <h3>${itemName}</h3>
                                    <p>${inventoryItem.fields.desc.stringValue}</p>
                                    <p>Price: $${price}</p>
                                    ${availabilityMessage} <!-- Inserted availability message -->
                                    ${quantityContainer} <!-- Inserted quantity container with conditionally disabled buttons -->
                                    <button onclick="deleteCartItem('${itemId}')">Delete</button>
                                </div>
                            `;

                        cartContainer.append(card); // Append the card to the container

                        } else {
                            console.log(`No matching inventory item or item not available for itemId: ${itemId}`);
                        }
                    });

                    // Update grand total
                    $('#grandTotal').text(`$${grandTotal}`);
                },
                error: function (error) {
                    console.error("Error fetching inventory items:", error);
                }
            });
        },
        error: function (error) {
            console.error("Error fetching cart items:", error);
            $('#buyCashBtn').prop('disabled', true);
            $('#buyCreditBtn').prop('disabled', true);
            cartContainer.append('<p>Failed to load cart items. Please try again later.</p>');
        }
    });
}




// Handle Increment/Decrement functionality
// $(document).on('click', '.increment, .decrement', function () {
//     const itemId = $(this).data('id');
//     const input = $(this).siblings('.quantity');
//     let currentQuantity = parseInt(input.val());

//     // Determine whether increment or decrement button is clicked
//     if ($(this).hasClass('increment')) {
//         currentQuantity++;
//     } else {
//         currentQuantity--;
//     }

//     // Ensure the quantity does not exceed the available stock or go below 1
//     $.ajax({
//         url: inventoryAPI, // Fetch all inventory items
//         type: 'GET',
//         success: function (inventoryResponse) {
//             const inventoryItems = inventoryResponse.documents;
//             const inventoryItem = inventoryItems.find(i => i.fields.item_id.integerValue == itemId);
//             const availableQuantity = inventoryItem.fields.quantity.integerValue;

//             if (currentQuantity > 0 && currentQuantity <= availableQuantity) {
//                 input.val(currentQuantity);

//                 // Update the quantity in cartItems array
//                 const itemToUpdate = cartItems.find(item => item.mapValue.fields.itemId.stringValue == itemId);
//                 itemToUpdate.mapValue.fields.quantity.integerValue = currentQuantity;
//                 // console.log("Hi");
//                 // Recalculate grand total
//                 renderCartItems();
//             } else {
//                 alert(`Only ${availableQuantity} items available.`);
//             }
//         },
//         error: function (error) {
//             console.error("Error fetching inventory item:", error);
//         }
//     });
// });

$(document).on('click', '.increment, .decrement', function () {
    const itemId = $(this).data('id'); // Get the itemId from the button's data-id attribute
    const input = $(this).siblings('.quantity'); // Get the input field for the quantity
    let currentQuantity = parseInt(input.val()); // Get the current quantity from the input field

    // Determine whether the increment or decrement button is clicked
    if ($(this).hasClass('increment')) {
        currentQuantity++;
    } else {
        currentQuantity--;
    }

    // Ensure the quantity does not exceed the available stock or go below 1
    $.ajax({
        url: inventoryAPI, // Fetch all inventory items
        type: 'GET',
        success: function (inventoryResponse) {
            const inventoryItems = inventoryResponse.documents;
            const inventoryItem = inventoryItems.find(i => i.fields.item_id.integerValue == itemId);
            const availableQuantity = inventoryItem.fields.quantity.integerValue;

            if (currentQuantity > 0 && currentQuantity <= availableQuantity) {
                input.val(currentQuantity); // Update the input field with the new quantity

                // Update the quantity in cartItems array
                const itemToUpdate = cartItems.find(item => item.mapValue.fields.itemId.stringValue == itemId);
                itemToUpdate.mapValue.fields.quantity.integerValue = currentQuantity;

                // Patch the updated cart back to Firestore
                $.ajax({
                    url: `${cartAPI}/${customerEmail}`, // Use the correct cart API URL
                    method: 'PATCH',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        fields: {
                            items: {
                                arrayValue: {
                                    values: cartItems // Preserve all existing fields and update the quantity
                                }
                            }
                        }
                    }),
                    success: function () {
                        console.log(`Quantity for itemId ${itemId} updated to ${currentQuantity}`);
                        renderCartItems(); // Recalculate grand total and refresh the cart display
                    },
                    error: function (error) {
                        console.error('Error updating cart:', error);
                    }
                });
            } else {
                alert(`Only ${availableQuantity} items available.`);
            }
        },
        error: function (error) {
            console.error("Error fetching inventory item:", error);
        }
    });
});

// Buy with Cash functionality

// Function to show the popup
function showPopup(message) {
    $('#successPopup').text(message);  // Set popup message
    $('#successPopup').addClass('show');  // Show the popup

    // Close the popup when "OK" button is clicked
    $('#closePopupBtn').click(function() {
        $('#successPopup').removeClass('show');
    });

    // Automatically hide the popup after 3 seconds
    setTimeout(function() {
        $('#successPopup').removeClass('show');
    }, 3000);  // Hide after 3 seconds
}

// Buy with Cash functionality
$('#buyCashBtn').click(function () {
    // Add 10 credit points for every $100 spent
    let creditPointsToAdd = Math.floor(grandTotal / 100) * 10;
    customerCreditScore = parseInt(customerCreditScore, 10) + creditPointsToAdd; // Convert to integer before adding

    // Generate Invoice CSV
    generateInvoiceCSV();

    // Process Purchase
    updateCustomerCreditScore();
    processPurchase("cash");

    // Show the success popup
    alert("Order placed successfully with cash!");
    showPopup("Order placed successfully with cash!");
});

$('#buyCreditBtn').click(function () {
    if (customerCreditScore >= 1000) {
        // Deduct total amount from credit score
        customerCreditScore -= grandTotal;

        // Generate Invoice CSV
        generateInvoiceCSV();

        // Process Purchase
        updateCustomerCreditScore();
        processPurchase("credit");

        // Show the success popup
        alert("Order placed successfully with credit!");
        showPopup("Order placed successfully with credit!");
    } else {
        alert("Insufficient credit score.");
    }
});

//invoice generation
function generateInvoiceCSV() {
    // Step 1: Fetch inventory data
    $.ajax({
        url: inventoryAPI,
        type: 'GET',
        success: function (inventoryResponse) {
            const inventoryItems = inventoryResponse.documents;

            // Step 2: Initialize CSV content
            let csvContent = "data:text/csv;charset=utf-8,Item Name,Quantity,Price,Subtotal\n";

            // Step 3: Loop through the cart items
            cartItems.forEach(cartItem => {
                const itemId = cartItem.mapValue.fields.itemId.stringValue;
                const quantity = cartItem.mapValue.fields.quantity.integerValue;

                // Find the corresponding item in the inventory
                const inventoryItem = inventoryItems.find(item => item.fields.item_id.integerValue == itemId);

                if (inventoryItem) {
                    const itemName = inventoryItem.fields.name.stringValue;
                    const price = inventoryItem.fields.price.integerValue;
                    const subtotal = price * quantity;

                    // Step 4: Append to CSV content
                    csvContent += `${itemName},${quantity},${price},${subtotal}\n`;
                }
            });

            // Step 5: Add the grand total at the end
            csvContent += `\nTotal: $${grandTotal}\n`;

            // Step 6: Download the CSV
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "invoice.csv");
            document.body.appendChild(link); // Required for Firefox
            link.click();
        },
        error: function (error) {
            console.error("Error fetching inventory data:", error);
        }
    });
}


// Update customer credit score in Firestore
function updateCustomerCreditScore() {
    // Fetch all customers and update credit score for matching email
    $.ajax({
        url: customerAPI,
        type: 'GET',
        success: function (response) {
            const customers = response.documents;
            const matchingCustomer = customers.find(c => c.fields.email.stringValue === customerEmail);

            if (matchingCustomer) {
                const customerDocId = matchingCustomer.name.split('/').pop();

                // Only update the `credit_score` field, preserve all other fields
                $.ajax({
                    url: `${customerAPI}/${customerDocId}?updateMask.fieldPaths=credit_score`,
                    type: 'PATCH',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        fields: {
                            credit_score: { integerValue: customerCreditScore }
                        }
                    }),
                    success: function () {
                        console.log("Customer credit score updated");
                        $('#creditScore').text(`Credit Score: ${customerCreditScore}`);
                    },
                    error: function (error) {
                        console.error("Error updating credit score:", error);
                    }
                });
            }
        },
        error: function (error) {
            console.error("Error fetching customer details:", error);
        }
    });
}


// Process purchase by transferring items from cart to order history
// function processPurchase(paymentMethod) {
//     const timestamp = new Date().toISOString();

//     // Fetch the current order history for the customer
//     $.ajax({
//         url: `${orderHistoryAPI}/${customerEmail}`,
//         type: 'GET',
//         success: function (response) {
//             let existingOrders = [];

//             // Check if the order history already exists and contains orders
//             if (response.fields && response.fields.orders) {
//                 existingOrders = response.fields.orders.arrayValue.values; // Get existing orders
//             }

//             // Format the new order items according to the reference structure
//             const newOrder = {
//                 mapValue: {
//                     fields: {
//                         items: {
//                             arrayValue: {
//                                 values: cartItems.map(item => ({
//                                     mapValue: {
//                                         fields: {
//                                             itemId: { integerValue: parseInt(item.mapValue.fields.itemId.stringValue, 10) },
//                                             quantity: { integerValue: item.mapValue.fields.quantity.integerValue }
//                                         }
//                                     }
//                                 }))
//                             }
//                         },
//                         amount: { integerValue: grandTotal },
//                         date: { stringValue: timestamp },
//                         paymentMethod: { stringValue: paymentMethod }
//                     }
//                 }
//             };

//             // Merge the new order with existing orders
//             const updatedOrders = existingOrders.concat([newOrder]);

//             // Prepare the order history entry with the updated orders array
//             const orderHistoryEntry = {
//                 fields: {
//                     email: { stringValue: customerEmail },
//                     orders: {
//                         arrayValue: {
//                             values: updatedOrders // Merge the existing orders with the new one
//                         }
//                     }
//                 }
//             };

//             // Store the updated order history in Firestore
//             $.ajax({
//                 url: `${orderHistoryAPI}/${customerEmail}`,
//                 type: 'PATCH',
//                 contentType: 'application/json',
//                 data: JSON.stringify(orderHistoryEntry),
//                 success: function () {
//                     showPopup("Item bought successfully!");

//                     // Clear the cart after purchase
//                     clearCart();
//                 },
//                 error: function (error) {
//                     console.error("Error updating order history:", error);
//                 }
//             });
//         },
//         error: function (error) {
//             console.error("Error fetching order history:", error);
//         }
//     });
// }
function processPurchase(paymentMethod) {
    const timestamp = new Date().toISOString();

    // Fetch the current order history for the customer
    $.ajax({
        url: `${orderHistoryAPI}/${customerEmail}`,
        type: 'GET',
        success: function (response) {
            let existingOrders = [];

            // Check if the order history already exists and contains orders
            if (response.fields && response.fields.orders) {
                existingOrders = response.fields.orders.arrayValue.values; // Get existing orders
            }

            // Format the new order items according to the reference structure
            const newOrder = {
                mapValue: {
                    fields: {
                        items: {
                            arrayValue: {
                                values: cartItems.map(item => ({
                                    mapValue: {
                                        fields: {
                                            itemId: { integerValue: parseInt(item.mapValue.fields.itemId.stringValue, 10) },
                                            quantity: { integerValue: item.mapValue.fields.quantity.integerValue }
                                        }
                                    }
                                }))
                            }
                        },
                        amount: { integerValue: grandTotal },
                        date: { stringValue: timestamp },
                        paymentMethod: { stringValue: paymentMethod }
                    }
                }
            };

            // Merge the new order with existing orders
            const updatedOrders = existingOrders.concat([newOrder]);

            // Prepare the order history entry with the updated orders array
            const orderHistoryEntry = {
                fields: {
                    email: { stringValue: customerEmail },
                    orders: {
                        arrayValue: {
                            values: updatedOrders // Merge the existing orders with the new one
                        }
                    }
                }
            };

            // Store the updated order history in Firestore
            $.ajax({
                url: `${orderHistoryAPI}/${customerEmail}`,
                type: 'PATCH',
                contentType: 'application/json',
                data: JSON.stringify(orderHistoryEntry),
                success: function () {
                    showPopup("Item bought successfully!");

                    // After order history is updated, update the inventory
                    updateInventoryAfterOrder(); 

                    // Clear the cart after purchase
                    clearCart();
                },
                error: function (error) {
                    console.error("Error updating order history:", error);
                }
            });
        },
        error: function (error) {
            createNewOrderFromCart();
            console.error("Error fetching order history:", error);
        }
    });
}
//-------------------------------------------------------------
// Clear cart after purchase
function clearCart() {
    $.ajax({
        url: `${cartAPI}/${customerEmail}`,
        method: 'DELETE',
        success: function () {
            console.log("Cart cleared after purchase");
            loadCartItems();
        },
        error: function (error) {
            console.error("Error clearing cart:", error);
        }
    });
}

// Show popup after purchase
function showPopup(message) {
    const popup = $('<div class="popup"></div>').text(message).appendTo('body');
    setTimeout(() => popup.remove(), 3000); // Remove after 3 seconds
}


//delete button 
// Delete cart item
function deleteCartItem(itemId) {
    const userId = customerEmail;
    if (confirm('Are you sure you want to delete this item?')) {
        $.ajax({
            url: `${cartAPI}/${customerEmail}`,
            method: 'GET',
            dataType: 'json',
            success: function (cartData) {
                let items = cartData.fields.items.arrayValue.values;
                console.log(items);
                if (items.length <= 0){
                    $('#buyCashBtn').prop('disabled', true);
                    $('#buyCreditBtn').prop('disabled', true);
                }
                // Filter out the item being deleted
                items = items.filter(item => item.mapValue.fields.itemId.stringValue !== itemId);

                $.ajax({
                    url: `${cartAPI}/${customerEmail}?updateMask.fieldPaths=items`,
                    method: 'PATCH',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        fields: {
                            items: {
                                arrayValue: {
                                    values: items
                                }
                            }
                        }
                    }),
                    success: function () {
                        // Find the item's DOM element and remove it from the page
                        // window.location.reload();  // Assuming each item has an element with id `cart-item-{itemId}`
                        // Optionally re-render the cart if you need to update total amounts, etc.
                        renderCartItems();  // If this function updates cart totals or other elements
                    },
                    error: function (error) {
                        console.error('Error deleting cart item:', error);
                    }
                });
            },
            error: function (error) {
                console.error('Error fetching cart data:', error);
            }
        });
    }
}


//update quantity after purchase
// Define your API endpoint

// Function to update inventory based on the order placed
function updateInventoryAfterOrder() {
    // Fetch the updated order history for the current customer (after the new order has been added)
    $.ajax({
        url: `${orderHistoryAPI}/${customerEmail}`,
        type: 'GET',
        success: function (orderResponse) {
            // Get the orders from the order history
            const orders = orderResponse.fields.orders.arrayValue.values;

            if (orders.length > 0) {
                const lastOrder = orders[orders.length - 1]; // Get the most recent order (which was just added)
                const orderItems = lastOrder.mapValue.fields.items.arrayValue.values; // Extract items from the last order

                // Loop through each item in the last order and update the inventory
                orderItems.forEach(orderItem => {
                    const itemId = parseInt(orderItem.mapValue.fields.itemId.integerValue, 10); // Get the itemId from the order
                    const orderedQuantity = orderItem.mapValue.fields.quantity.integerValue; // Get the quantity from the order

                    // Fetch the corresponding inventory item with this itemId
                    $.ajax({
                        url: inventoryAPI, // Fetch all inventory items
                        type: 'GET',
                        success: function (inventoryResponse) {
                            const inventoryItems = inventoryResponse.documents; // Get all inventory items
                            const matchingInventoryItem = inventoryItems.find(item => item.fields.item_id.integerValue == itemId); // Find the matching item

                            if (matchingInventoryItem) {
                                const currentQuantity = matchingInventoryItem.fields.quantity.integerValue;
                                const newQuantity = currentQuantity - orderedQuantity; // Subtract the ordered quantity from the current quantity
                                const inventoryDocId = matchingInventoryItem.name.split('/').pop(); // Extract the document ID

                                // Preserve all fields except for the quantity, update only the quantity
                                const updatedFields = {
                                    ...matchingInventoryItem.fields, // Retain all existing fields
                                    quantity: { integerValue: newQuantity }, // Update only the quantity field
                                    // availability: { booleanValue: newQuantity > 0 } // Set availability to false if the quantity is 0
                                };

                                // Update the inventory with the new quantity and availability
                                $.ajax({
                                    url: `${inventoryAPI}/${inventoryDocId}`, // Use the document ID to update the specific item
                                    type: 'PATCH',
                                    contentType: 'application/json',
                                    data: JSON.stringify({ fields: updatedFields }),
                                    success: function () {
                                        console.log(`Inventory updated for itemId: ${itemId}, new quantity: ${newQuantity}`);
                                    },
                                    error: function (error) {
                                        console.error(`Error updating inventory for itemId: ${itemId}`, error);
                                    }
                                });
                            } else {
                                console.error(`Item with itemId: ${itemId} not found in inventory.`);
                            }
                        },
                        error: function (error) {
                            console.error(`Error fetching inventory for itemId: ${itemId}`, error);
                        }
                    });
                });
            } else {
                console.log("No orders found in order history.");
            }
        },
        error: function (error) {
            console.error("Error fetching order history: ", error);
        }
    });
}

function createNewOrderFromCart() {
    const customerEmail = sessionStorage.getItem("customer_email"); // Get customer email from session
    const timestamp = new Date().toISOString(); // Get current timestamp for the order

    // Fetch the current cart for the customer
    $.ajax({
        url: `${cartAPI}/${customerEmail}`, // Cart API path
        type: 'GET',
        success: function (cartResponse) {
            const cartItems = cartResponse.fields.items.arrayValue.values; // Get cart items

            // Format the new order using the cart items
            const newOrder = {
                mapValue: {
                    fields: {
                        items: {
                            arrayValue: {
                                values: cartItems.map(item => ({
                                    mapValue: {
                                        fields: {
                                            itemId: { integerValue: parseInt(item.mapValue.fields.itemId.stringValue, 10) },
                                            quantity: { integerValue: item.mapValue.fields.quantity.integerValue }
                                        }
                                    }
                                }))
                            }
                        },
                        amount: { integerValue: calculateCartTotal(cartItems) }, // Calculate total amount
                        date: { stringValue: timestamp }, // Order timestamp
                        paymentMethod: { stringValue: "cash" } // Assume cash, change based on real payment method
                    }
                }
            };

            // Prepare the order history entry
            const orderHistoryEntry = {
                fields: {
                    email: { stringValue: customerEmail },
                    orders: {
                        arrayValue: {
                            values: [newOrder] // Add the new order as the first entry in the order history
                        }
                    }
                }
            };

            // Store the new order in order history
            $.ajax({
                url: `${orderHistoryAPI}/${customerEmail}`,
                type: 'PATCH',
                contentType: 'application/json',
                data: JSON.stringify(orderHistoryEntry),
                success: function () {
                    console.log("Order history created with cart items.");

                    // After successfully creating the order, update the inventory
                    updateInventoryAfterOrder();

                    // Clear the cart after moving items to order history
                    clearCart();
                },
                error: function (error) {
                    console.error("Error creating order history from cart:", error);
                }
            });
        },
        error: function (error) {
            console.error("Error fetching cart data:", error);
        }
    });
}

// Helper function to calculate total amount of the cart
function calculateCartTotal(cartItems) {
    return cartItems.reduce((total, item) => {
        const quantity = item.mapValue.fields.quantity.integerValue;
        const price = parseInt(item.mapValue.fields.price ? item.mapValue.fields.price.integerValue : 0, 10);
        return total + (price * quantity);
    }, 0);
}







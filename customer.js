const inventoryAPI = "https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/inventory";
const cartAPI = "https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/cart";
const countersAPI = "https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/counters";
const categoryAPI = "https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/category";
const apiUrl = "https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/";
const email = sessionStorage.getItem("customer_email");

let currentPage = 1;
const itemsPerPage = 5; // Number of items to display per page
let totalItems = 0;
let filteredItems = [];
$(document).ready(function() {
    // Event listener for the Order History button
    $('#orderHistoryBtn').click(function() {
        // Redirect to the order history page
        window.location.href = 'order_history.html'; // Make sure to replace with the correct path to your order history page
    });
});

$(document).ready(function () {
    let darkMode = false; // Track dark mode status
    
    // Initialize dark mode button with moon emoji
    $('#darkModeToggle').html('🌙');
    
    // Dark mode toggle functionality
    $('#darkModeToggle').click(function () {
        darkMode = !darkMode; // Toggle the mode
        
        if (darkMode) {
            $('body').addClass('dark-mode');
            $('#darkModeToggle').html('☀️'); // Change to sun emoji for light mode
        } else {
            $('body').removeClass('dark-mode');
            $('#darkModeToggle').html('🌙'); // Change to moon emoji for dark mode
        }
    });
});


// Fetch available items with pagination and display them
function loadInventory(page = 1) {
    $.ajax({
        url: inventoryAPI,
        type: 'GET',
        success: function (response) {
            const allItems = response.documents.filter(item => item.fields.availability.booleanValue);
            totalItems = allItems.length;
            filteredItems = allItems; // Save the filtered items globally

            displayItems(allItems.slice((page - 1) * itemsPerPage, page * itemsPerPage)); // Display items for the current page
            updatePaginationControls();
        },
        error: function (error) {
            console.error("Error loading inventory:", error);
        }
    });
}

// Display items as cards with pagination
function displayItems(items) {
    const container = $("#inventoryContainer");
    container.empty();

    items.forEach(item => {
        const fields = item.fields;
        const itemId = fields.item_id.integerValue;
        const name = fields.name.stringValue;
        const price = fields.price.integerValue;
        const availableQuantity = fields.quantity.integerValue;
        const image = fields.image.stringValue;

        const card = `
            <div class="inventory-card">
                <img src="data:image/png;base64,${image}" alt="${name}">
                <div class="item-details">
                    <h3>${name}</h3>
                    <p>Price: $${price}</p>
                    <p>Available: ${availableQuantity}</p>
                    <button class="addToCartBtn" data-id="${itemId}" data-name="${name}">Add to Cart</button>
                </div>
            </div>
        `;
        container.append(card);
    });

    // Attach event listener for Add to Cart buttons
    $(".addToCartBtn").click(function () {
        const itemId = $(this).data("id");
        addToCart(itemId);
    });
}
function addToCart(itemId) {
   
    // Fetch the current cart from Firestore
    $.ajax({
        url: `${apiUrl}cart/${email}`,
        method: 'GET',
        success: function (response) {
            let cart = [];
            if (
                response.fields &&
                response.fields.items &&
                response.fields.items.arrayValue &&
                response.fields.items.arrayValue.values &&
                Array.isArray(response.fields.items.arrayValue.values) // Ensure it's an array
            ) {
                // Map the current cart items into a usable array
                cart = response.fields.items.arrayValue.values.map(item => ({
                    itemId: item.mapValue.fields.itemId.stringValue,
                    quantity: parseInt(item.mapValue.fields.quantity.integerValue, 10) // Ensure quantity is treated as an integer
                }));
            }
 
            // Check if the product is already in the cart
            const productIndex = cart.findIndex(item => item.itemId === itemId.toString());
 
            if (productIndex === -1) {
                // Product not in cart, add it with default quantity 1
                cart.push({ itemId: itemId.toString(), quantity: 1 });
                alert('Product added to cart!');
 
                // Prepare the cart to be updated in Firestore
                const updatedCart = cart.map(item => ({
                    mapValue: {
                        fields: {
                            itemId: { stringValue: item.itemId },
                            quantity: { integerValue: item.quantity }
                        }
                    }
                }));
 
                // Update the cart in Firestore
                $.ajax({
                    url: `${apiUrl}cart/${email}?updateMask.fieldPaths=items`,
                    method: 'PATCH',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        fields: {
                            items: {
                                arrayValue: {
                                    values: updatedCart
                                }
                            }
                        }
                    }),
                    success: function () {
                        console.log('Cart updated successfully');
                    },
                    error: function (error) {
                        console.error('Error updating cart:', error);
                    }
                });
            } else {
                // Product already exists in cart
                alert(`Product with item ID ${itemId} already exists in cart.`);
            }
        },
        error: function (error) {
            // Handle case where the document is not found (404)
            if (error.status === 404) {
                console.log("Cart document not found. Creating a new one...");
 
                // Create the cart document with the product and default quantity 1
                const cart = [
                    {
                        mapValue: {
                            fields: {
                                itemId: { stringValue: itemId.toString() },
                                quantity: { integerValue: 1 }
                            }
                        }
                    }
                ];
 
                // Create a new document in the cart collection for this user
                $.ajax({
                    url: `${apiUrl}cart/${email}`,
                    method: 'PATCH',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        fields: {
                            items: {
                                arrayValue: {
                                    values: cart
                                }
                            }
                        }
                    }),
                    success: function () {
                        alert('Cart created and product added!');
                    },
                    error: function (error) {
                        console.error('Error creating cart:', error);
                    }
                });
            } else {
                console.error('Error fetching cart:', error);
            }
        }
    });
}
// Pagination controls
function updatePaginationControls() {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    $('#paginationControls').html(`
        <button id="prevBtn" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
        <span>Page ${currentPage} of ${totalPages}</span>
        <button id="nextBtn" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
    `);

    // Attach event listeners for pagination buttons
    $('#prevBtn').click(function () {
        if (currentPage > 1) {
            currentPage--;
            loadInventory(currentPage);
        }
    });

    $('#nextBtn').click(function () {
        if (currentPage < totalPages) {
            currentPage++;
            loadInventory(currentPage);
        }
    });
}

// Fetch categories and populate the dropdown
function loadCategories() {
    $.ajax({
        url: categoryAPI,
        type: 'GET',
        success: function (response) {
            const categories = response.documents.map(category => {
                return {
                    id: category.fields.category_id.integerValue,
                    name: category.fields.name.stringValue
                };
            });

            populateCategoryDropdown(categories);
        },
        error: function (error) {
            console.error("Error loading categories:", error);
        }
    });
}

let categoriesMap = {}; // Store categories and their corresponding IDs

// Populate the category dropdown
function populateCategoryDropdown(categories) {
    const dropdown = $('#categoryDropdown');
    dropdown.empty();

    dropdown.append('<option value="">All Categories</option>'); // Default option

    categories.forEach(category => {
        // Map category name to its id
        categoriesMap[category.name] = category.id;
        dropdown.append(`<option value="${category.name}">${category.name}</option>`);
    });

    // Handle category selection change
    dropdown.change(function () {
        const selectedCategoryName = $(this).val(); // Get the selected category name
        if (selectedCategoryName) {
            const selectedCategoryId = categoriesMap[selectedCategoryName]; // Map the selected name to its ID
            filterItemsByCategory(selectedCategoryId); // Use category_id for filtering
        } else {
            loadInventory(1); // Load all items if no category is selected
        }
    });
}

// Filter items by category
function filterItemsByCategory(categoryId) {
    const filtered = filteredItems.filter(item => {
        return item.fields.categoryID.integerValue === categoryId;
    });

    totalItems = filtered.length;
    currentPage = 1;
    displayItems(filtered.slice(0, itemsPerPage)); // Display the first page of filtered items
    updatePaginationControls();
}


// Search functionality
$("#searchBar").on("input", function () {
    const searchTerm = $(this).val().toLowerCase();
    $.ajax({
        url: inventoryAPI,
        type: 'GET',
        success: function (response) {
            const items = response.documents.filter(item => {
                const name = item.fields.name.stringValue.toLowerCase();
                const desc = item.fields.desc.stringValue.toLowerCase();
                return name.includes(searchTerm) || desc.includes(searchTerm);
            });
            filteredItems = items;
            totalItems = items.length;
            currentPage = 1;
            displayItems(items.slice(0, itemsPerPage)); // Display the first page of search results
            updatePaginationControls();
        },
        error: function (error) {
            console.error("Error searching items:", error);
        }
    });
});

$(document).ready(function () {
    loadInventory();
    loadCategories(); // Load categories when the page loads
});

// Event listener to open the cart page when the Cart button is clicked
document.getElementById('cartBtn').addEventListener('click', function() {
    window.location.href = 'cart.html'; // Redirects to the cart page
});

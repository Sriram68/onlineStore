// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyApqCgfcJ_lYU5TuefLzFSr9TAaXAP_3WI",
    authDomain: "onlinestore-361f6.firebaseapp.com",
    projectId: "onlinestore-361f6",
    storageBucket: "onlinestore-361f6.appspot.com",
    messagingSenderId: "349762694059",
    appId: "1:349762694059:web:c129c6df665fbec49180ee",
    measurementId: "G-H1WQ6ZGVVV"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
var db = firebase.firestore();

// Initialize Firebase Auth
var auth = firebase.auth();

// Firestore API URLs
var countersAPI = "https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/counters";
var cartAPI = "https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/cart";
var inventoryAPI = "https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/inventory";
var usersAPI = "https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/customer";

// Dark Mode Toggle Functionality
// Dark Mode Toggle Functionality
$(document).ready(function () {
    $('#darkModeToggle').click(function () {
        $('body').toggleClass('dark-mode');

        // Toggle button text (emoji)
        if ($('body').hasClass('dark-mode')) {
            $(this).text('🌞'); // Change to sun emoji for light mode
        } else {
            $(this).text('🌙'); // Change to moon emoji for dark mode
        }
    });
});

// Function to save user data into Firestore
function saveUserToFirestore(userId, userData) {
    return db.collection('customer').doc(userId).set(userData)
        .then(() => {
            console.log('User saved to Firestore');
        })
        .catch((error) => {
            console.error('Error saving user to Firestore: ', error);
        });
}

// Sign-Up with Email and Password
$("#signupForm").submit(function (e) {
    e.preventDefault();

    var email = $("#signupEmail").val();
    var password = $("#signupPassword").val();
    var name = $("#signupName").val();
    var mobile = $("#mobile").val();

    // Step 1: Fetch the current customer_id from customer_counter
    $.ajax({
        url: countersAPI + '/customer_counter',
        type: 'GET',
        success: function (response) {
            if (response.fields && response.fields.customer_id) {
                var customerId = parseInt(response.fields.customer_id.integerValue);

                // Increment customer_id
                var newCustomerId = customerId + 1;

                // Firebase sign-up with email and password
                auth.createUserWithEmailAndPassword(email, password)
                    .then(function (userCredential) {
                        
                        var user = userCredential.user;

                        // Prepare user data to be saved in Firestore
                        var userData = {
                            customer_id: newCustomerId,
                            email: email,
                            password: password, // Only for internal usage (avoid storing plain text passwords)
                            name: name,
                            mobile_number: mobile, // Assuming mobile_number is a string; if integer, use parseInt(mobile)
                            credit_score: 0,
                            role: 'user' // Add role field
                        };

                        // Save user data to Firestore
                        return saveUserToFirestore(user.uid, userData);
                    })
                    .then(function () {
                        alert("Customer signed up successfully with ID: " + newCustomerId);

                        // Send welcome email
                        // sendEmail(email, "Welcome to Online Store", "Hello " + name + ", welcome to our online store! Your customer ID is: " + newCustomerId);

                        // Update the customer_counter with the incremented ID
                        $.ajax({
                            url: countersAPI + '/customer_counter',
                            type: 'PATCH',
                            contentType: 'application/json',
                            data: JSON.stringify({
                                fields: {
                                    customer_id: { integerValue: newCustomerId }
                                }
                            }),
                            success: function () {
                                console.log("Customer counter updated successfully.");
                            },
                            error: function (error) {
                                console.log("Error updating customer counter: ", error);
                            }
                        });
                    })
                    .catch(function (error) {
                        alert('Error: ' + error.message);
                    });
            } else {
                console.log("Error: customer_id is missing in customer_counter document.");
            }
        },
        error: function (error) {
            console.log("Error fetching customer_counter: ", error);
        }
    });
});

// Google Sign-In
// $('#googleSignIn').click(function () {
//     var provider = new firebase.auth.GoogleAuthProvider();

//     auth.signInWithPopup(provider)
//         .then(function (result) {
//             var user = result.user;

//             // Fetch the current customer_id from customer_counter
//             $.ajax({
//                 url: countersAPI + '/customer_counter',
//                 type: 'GET',
//                 success: function (response) {
//                     if (response.fields && response.fields.customer_id) {
//                         var customerId = parseInt(response.fields.customer_id.integerValue);

//                         // Increment customer_id
//                         var newCustomerId = customerId + 1;

//                         // Prepare user data to be saved in Firestore
//                         var userData = {
//                             customer_id: newCustomerId,
//                             email: user.email,
//                             name: user.displayName,
//                             mobile_number: null, // Set as null or default for Google Sign-In
//                             credit_score: 0,
//                             role: 'user' // Add role field
//                         };

//                         // Save user data to Firestore
//                         return saveUserToFirestore(user.uid, userData);
//                     }
//                 }
//             })
//             .then(function () {
//                 alert('User signed in with Google and saved successfully!');

//                 // Update the customer_counter with the incremented ID
//                 $.ajax({
//                     url: countersAPI + '/customer_counter',
//                     type: 'PATCH',
//                     contentType: 'application/json',
//                     data: JSON.stringify({
//                         fields: {
//                             customer_id: { integerValue: newCustomerId }
//                         }
//                     }),
//                     success: function () {
//                         console.log("Customer counter updated successfully.");
//                     },
//                     error: function (error) {
//                         console.log("Error updating customer counter: ", error);
//                     }
//                 });
//             })
//             .catch(function (error) {
//                 alert('Google Sign-In Error: ' + error.message);
//             });
// });
// });

$('#googleSignIn').click(async function (e) {
    e.preventDefault();
 
    const provider = new firebase.auth.GoogleAuthProvider();
 
    auth.signInWithPopup(provider)
        .then(function (result) {
            // Display success message
            alert('Google Sign-In Successful!');
 
            // Get signed-in user ID
            const userId = result.user.uid;
            const userEmail = result.user.email;
 
            // Fetch user details from Firestore
            db.collection('customer').doc(userId).get().then(function (doc) {
                if (doc.exists) {
                    // const userRole = doc.data().role; // Assuming 'role' field exists in Firestore
                    const userName = doc.data().name;
 
                    // Store userId and userRole in sessionStorage
                 
                    sessionStorage.setItem('customerEmail', userEmail); // Store email in sessionStorage
 
                    // Redirect based on user role or email
                    if (userEmail === 'everygame68@gmail.com') {
                        alert(`Welcome Admin!`);
                        window.location.href = 'admin.html'; // Redirect to admin page
                    }else {
                        alert(`Welcome ${userName}`);
                            window.location.href = 'customer.html';
                    }
                 }
            }).catch(function (error) {
                console.error('Error getting user document:', error);
            });
        })
        .catch(function (error) {
            console.error('Error during Google Sign-In: ', error);
            alert('Google Sign-In failed: ' + error.message);
        });
});
// Sign-in with email and password
$("#loginForm").submit(function (e) {
    e.preventDefault();
    var email = $("#loginEmail").val();
    var password = $("#loginPassword").val();

    auth.signInWithEmailAndPassword(email, password)
        .then(function (userCredential) {
            var user = userCredential.user;

            // If the email matches the admin email, redirect to admin page
            if (user.email === 'everygame68@gmail.com') {
                window.location.href = "admin.html";
            } else {
                // Otherwise, check the user's Firestore document
                db.collection('customer').doc(user.uid).get()
                    .then(function (doc) {
                        if (doc.exists) {
                            sessionStorage.setItem('customer_email', email);
                            window.location.href = "customer.html"; // Redirect to customer page
                        } else {
                            console.error('No such user document!');
                            alert("No user data found.");
                        }
                    })
                    .catch(function (error) {
                        console.error('Error fetching user data:', error);
                    });
            }
        })
        .catch(function (error) {
            alert("Error: " + error.message);
        });
});


// Reset Password
$("#resetPassword").click(function () {
    var email = prompt("Enter your email to reset password:");
    if (email) {
        auth.sendPasswordResetEmail(email)
            .then(function () {
                alert("Password reset email sent! Check your inbox.");
            })
            .catch(function (error) {
                alert("Error: " + error.message);
            });
    }
});





// var countersAPI = "https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/counters";
// var cartAPI = "https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/cart";
// var inventoryAPI = "https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/inventory";
// var usersAPI = "https://firestore.googleapis.com/v1/projects/onlinestore-361f6/databases/(default)/documents/customer";

// // Email sending function using a custom SMTP service
// function sendEmail(to, subject, message) {
//     var emailServiceUrl = "https://your-email-service-api/send"; // Replace with your own email sending API URL
//     $.ajax({
//         url: emailServiceUrl,
//         type: 'POST',
//         contentType: 'application/json',
//         data: JSON.stringify({
//             to: to,
//             subject: subject,
//             message: message
//         }),
//         success: function () {
//             console.log("Email sent successfully to " + to);
//         },
//         error: function (error) {
//             console.log("Error sending email: " + error.message);
//         }
//     });
// }

// // Sign-Up Function
// $("#signupForm").submit(function (e) {
//     e.preventDefault();

//     var email = $("#signupEmail").val();
//     var password = $("#signupPassword").val();
//     var name = $("#signupName").val();
//     var mobile = $("#mobile").val();
    
//     // Step 1: Fetch the current customer_id from customer_counter
//     $.ajax({
//         url: countersAPI + '/customer_counter',
//         type: 'GET',
//         success: function (response) {
//             if (response.fields && response.fields.customer_id) {
//                 var customerId = parseInt(response.fields.customer_id.integerValue); // Get the current customer_id

//                 // Step 2: Increment customer_id
//                 var newCustomerId = customerId + 1;

//                 // Step 3: Insert new customer into the customer collection
//                 $.ajax({
//                     url: usersAPI,
//                     type: 'POST', // Use POST to insert a new document
//                     contentType: 'application/json',
//                     data: JSON.stringify({
//                         fields: {
//                             customer_id: { integerValue: newCustomerId },
//                             email: { stringValue: email },
//                             password: { stringValue: password },
//                             name: { stringValue: name },
//                             credit_score: { integerValue: 0 },
//                             mobile_number: { integerValue: mobile }
//                         }
//                     }),
//                     success: function () {
//                         alert("Customer signed up successfully with ID: " + newCustomerId);

//                         // Send welcome email
//                         sendEmail(email, "Welcome to Online Store", "Hello " + name + ", welcome to our online store! Your customer ID is: " + newCustomerId);

//                         // Step 4: Update the customer_counter with the incremented ID
//                         $.ajax({
//                             url: countersAPI + '/customer_counter',
//                             type: 'PATCH',
//                             contentType: 'application/json',
//                             data: JSON.stringify({
//                                 fields: {
//                                     customer_id: { integerValue: newCustomerId }
//                                 }
//                             }),
//                             success: function () {
//                                 console.log("Customer counter updated successfully.");
//                             },
//                             error: function (error) {
//                                 console.log("Error updating customer counter: ", error);
//                             }
//                         });
//                     },
//                     error: function (error) {
//                         console.log("Error inserting new customer: ", error);
//                     }
//                 });
//             } else {
//                 console.log("Error: customer_id is missing in customer_counter document.");
//             }
//         },
//         error: function (error) {
//             console.log("Error fetching customer_counter: ", error);
//         }
//     });
// });

// // Sign-in with email and password
// $("#loginForm").submit(function (e) {
//     e.preventDefault();
//     var email = $("#loginEmail").val();
//     var password = $("#loginPassword").val();
    
//     $.ajax({
//         url: usersAPI,
//         type: 'GET',
//         success: function (response) {
//             if (response.documents && Array.isArray(response.documents)) {
//                 var users = response.documents;
//                 var loggedIn = false;
//                 if (email === "subhash.ep@gmail.com" && password === "subhash") {
//                     window.location.href = "admin.html";
//                     loggedIn = true;
//                 } 
//                 users.forEach(function (user) {
//                     var userData = user.fields;
//                     if (userData.email.stringValue === email && userData.password.stringValue === password) {
//                         loggedIn = true;
    
//                         if (email === "subhash.ep@gmail.com" && password === "subhash") {
//                             window.location.href = "admin.html";
//                         } else {
//                             sessionStorage.setItem('customer_email', email);
//                             window.location.href = "customer.html";
//                         }
//                     }
//                 });
    
//                 if (!loggedIn) {
//                     alert("Invalid email or password.");
//                 }
//             } else {
//                 alert("No users found or an error occurred.");
//             }
//         },
//         error: function (error) {
//             console.log("Error: ", error);
//             alert("Error fetching users.");
//         }
//     });
// });

// $("#resetPassword").click(function () {
//     var email = prompt("Enter your email to reset password:");
//     if (email) {
//         // Step 1: Fetch users from the Firestore
//         $.ajax({
//             url: usersAPI,
//             type: 'GET',
//             success: function (response) {
//                 var users = response.documents;
//                 var userExists = false;

//                 // Step 2: Check if user exists
//                 users.forEach(function (user) {
//                     var userData = user.fields;
//                     if (userData.email.stringValue === email) {
//                         userExists = true;
//                         var newPassword = prompt("Enter your new password:");

//                         if (newPassword) {
//                             var userDocId = user.name.split('/').pop();

//                             // Step 3: Fetch existing user data to keep other fields
//                             $.ajax({
//                                 url: usersAPI + "/" + userDocId,
//                                 type: 'GET',
//                                 success: function (existingData) {
//                                     // Step 4: Prepare updated data
//                                     const updatedFields = {
//                                         ...existingData.fields, // Spread existing fields
//                                         password: { stringValue: newPassword } // Update password field
//                                     };

//                                     // Step 5: Update the user's password
//                                     $.ajax({
//                                         url: usersAPI + "/" + userDocId,
//                                         type: 'PATCH',
//                                         contentType: 'application/json',
//                                         data: JSON.stringify({
//                                             fields: updatedFields
//                                         }),
//                                         success: function () {
//                                             alert("Password reset successfully.");

//                                             // Send reset password email
//                                             sendEmail(email, "Password Reset", "Your password has been reset successfully.");
//                                         },
//                                         error: function (error) {
//                                             alert("Error resetting password: " + error.message);
//                                         }
//                                     });
//                                 },
//                                 error: function (error) {
//                                     alert("Error fetching existing user data.");
//                                 }
//                             });
//                         }
//                     }
//                 });

//                 // Step 6: Handle case where no user was found
//                 if (!userExists) {
//                     alert("No user found with this email.");
//                 }
//             },
//             error: function (error) {
//                 alert("Error: " + error.message);
//             }
//         });
//     }
// });


// Firebase configuration
// const firebaseConfig = {
//     const firebaseConfig = {
//   apiKey: "AIzaSyApqCgfcJ_lYU5TuefLzFSr9TAaXAP_3WI",
//   authDomain: "onlinestore-361f6.firebaseapp.com",
//   projectId: "onlinestore-361f6",
//   storageBucket: "onlinestore-361f6.appspot.com",
//   messagingSenderId: "349762694059",
//   appId: "1:349762694059:web:c129c6df665fbec49180ee",
//   measurementId: "G-H1WQ6ZGVVV"
// };
// };
// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);
 
// // Initialize Firestore
// var db = firebase.firestore();
 
// // Firebase Auth instance
// var auth = firebase.auth();
 
 
// // Function to insert user data into Firestore
// function saveUserToFirestore(userId, userData) {
//     return db.collection('users').doc(userId).set(userData)
//         .then(() => {
//             console.log('User saved to Firestore');
//         })
//         .catch((error) => {
//             console.error('Error saving user to Firestore: ', error);
//         });
// }
 
// // Sign-Up with Email and Password
// $('#signUpForm').submit(function(e) {
//     e.preventDefault();  // Prevent form submission
 
//     var name = $('#name').val();
//     var email = $('#email').val();
//     var mobileNo = $('#mobileNo').val();
//     var password = $('#password').val();
 
//     // Firebase sign-up with email and password
//     auth.createUserWithEmailAndPassword(email, password)
//         .then(function(userCredential) {
//             var user = userCredential.user; // Get the user object
 
//             // Prepare user data to be saved in Firestore
//             var userData = {
//                 userId: user.uid,              // Use Firebase UID directly
//                 name: name,
//                 email: email,
//                 mobileNo: mobileNo,
//                 creditLimit: 0,                // Default value for credit limit
//                 role: 'user'                   // Default role
//             };
 
//             // Save user data to Firestore with userId as the document ID
//             return saveUserToFirestore(user.uid, userData);
//         })
//         .then(function() {
//             alert('User signed up successfully!');
//         })
//         .catch(function(error) {
//             alert('Error: ' + error.message);
//         });
// });
 
// // Google Sign-In
// $('#googleSignIn').click(function() {
//     var provider = new firebase.auth.GoogleAuthProvider();
 
//     auth.signInWithPopup(provider)
//         .then(function(result) {
//             var user = result.user;
 
//             // Prepare user data to be saved in Firestore
//             var userData = {
//                 userId: user.uid,                // Use Firebase UID directly
//                 name: user.displayName,         // Get the user's display name
//                 email: user.email,              // Get the user's email
//                 mobileNo: null,                 // Optional field; set it to null or another default value
//                 creditLimit: 0,                 // Default value for credit limit
//                 role: 'user'                    // Default role
//             };
 
//             // Save user data to Firestore with userId as the document ID
//             return saveUserToFirestore(user.uid, userData);
//         })
//         .then(function() {
//             alert('User signed in with Google and saved successfully!');
//         })
//         .catch(function(error) {
//             alert('Google Sign-In Error: ' + error.message);
//         });
// });




// const firebaseConfig = {
//     const firebaseConfig = {
//         apiKey: "AIzaSyApqCgfcJ_lYU5TuefLzFSr9TAaXAP_3WI",
//         authDomain: "onlinestore-361f6.firebaseapp.com",
//         projectId: "onlinestore-361f6",
//         storageBucket: "onlinestore-361f6.appspot.com",
//         messagingSenderId: "349762694059",
//         appId: "1:349762694059:web:c129c6df665fbec49180ee",
//         measurementId: "G-H1WQ6ZGVVV"
// };
// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);
 
// // Initialize Firestore
// var db = firebase.firestore();
 
 
// var auth = firebase.auth();
 
// // Handle Sign-In
// $('#signInForm').submit(function(e) {
//     e.preventDefault();  // Prevent form submission
 
//     var email = $('#email').val();
//     var password = $('#password').val();
 
//     auth.signInWithEmailAndPassword(email, password)
//         .then(function(userCredential) {
//             alert('Signed in successfully!');
 
//             // Get user ID
//             const userId = userCredential.user.uid;
 
//             // Assuming the user role is stored in Firestore, you can fetch it like this:
//             db.collection('users').doc(userId).get().then(function(doc) {
//                 if (doc.exists) {
//                     const userRole = doc.data().role; // Adjust this field name based on your Firestore document structure
 
//                     // Store userId and userRole in sessionStorage
//                     localStorage.setItem('userId', userId);
//                     localStorage.setItem('userRole', userRole);
 
//                     // Redirect or do something upon successful login
//                     window.location.href = 'userProduct.html'; // Change this to your desired redirect page
//                 } else {
//                     console.error('No such user document!');
//                 }
//             }).catch(function(error) {
//                 console.error('Error getting user document:', error);
//             });
//         })
//         .catch(function(error) {
//             alert('Error: ' + error.message);
//         });
// });
 
// // Handle Forgot Password
// $('#forgotPasswordLink').click(function(e) {
//     e.preventDefault();
 
//     var email = prompt('Please enter your email for password reset:');
 
//     if (email) {
//         auth.sendPasswordResetEmail(email)
//             .then(function() {
//                 alert('Password reset email sent! Check your inbox.');
//             })
//             .catch(function(error) {
//                 alert('Error: ' + error.message);
//             });
//     }
// });
// // Google Sign-In
// $('#googleSignIn').click(function() {
//     var provider = new firebase.auth.GoogleAuthProvider();
 
//     auth.signInWithPopup(provider)
//         .then(function(result) {
//             alert('Signed in with Google!');
 
//             // Get user ID
//             const userId = result.user.uid;
 
//             // Assuming the user role is stored in Firestore, you can fetch it like this:
//             db.collection('users').doc(userId).get().then(function(doc) {
//                 if (doc.exists) {
//                     const userRole = doc.data().role; // Adjust this field name based on your Firestore document structure
 
//                     // Store userId and userRole in sessionStorage
//                     localStorage.setItem('userId', userId);
//                     localStorage.setItem('userRole', userRole);
 
//                     // Redirect or do something upon successful login
//                     window.location.href = 'userProduct.html'; // Change this to your desired redirect page
//                 } else {
//                     console.error('No such user document!');
//                 }
//             }).catch(function(error) {
//                 console.error('Error getting user document:', error);
//             });
//         })
//         .catch(function(error) {
//             alert('Google Sign-In Error: ' + error.message);
//         });
//});

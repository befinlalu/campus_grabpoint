// API Base URL
var api = "http://localhost:8000/api";

// Registration Form Submission
document.getElementById("registration-form").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission

    // Collect form data
    const formData = {
        full_name: document.getElementById("register-name").value,
        username: document.getElementById("register-no").value,
        email: document.getElementById("register-email").value,
        password: document.getElementById("register-password").value
    };

    // Show loading alert
    Swal.fire({
        title: "Registering...",
        text: "Please wait while we create your account.",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const response = await fetch(`${api}/auth/register/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            Swal.fire({
                icon: "success",
                title: "Registration Successful",
                text: "Your account has been created successfully!",
                confirmButtonText: "OK"
            }).then(() => {
                document.getElementById("register-name").value = "";
                document.getElementById("register-no").value = "";
                document.getElementById("register-email").value = "";
                document.getElementById("register-password").value = "";
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Registration Failed",
                text: data.message || "Something went wrong!",
                confirmButtonText: "Try Again"
            });
        }
    } catch (error) {
        console.error("Error:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Something went wrong. Please try again later.",
            confirmButtonText: "OK"
        });
    }
});

// Login Form Submission
document.getElementById("login-form").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent form from refreshing

    // Collect input values
    const formData = {
        username: document.getElementById("singin-email").value,  // Assuming Admission No is the username
        password: document.getElementById("singin-password").value
    };

    // Show loading alert
    Swal.fire({
        title: "Logging in...",
        text: "Please wait while we verify your credentials.",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const response = await fetch(`${api}/auth/login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.access);

            Swal.fire({
                icon: "success",
                title: "Login Successful",
                text: "Welcome back!",
                confirmButtonText: "OK"
            }).then(() => {
                window.location.href = "index.html"; // Redirect after success
            });
        } else {
            let errorMessage = data.detail ? data.detail : data.message || "Invalid Admission No or Password!";
            Swal.fire({
                icon: "error",
                title: "Login Failed",
                text: errorMessage,
                confirmButtonText: "Try Again"
            });
        }
    } catch (error) {
        console.error("Error:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Something went wrong. Please try again later.",
            confirmButtonText: "OK"
        });
    }
});


document.addEventListener("DOMContentLoaded", function () {
    const authLink = document.getElementById("auth-link");
    const authText = document.getElementById("auth-text");
    const token = localStorage.getItem("token");

    if (token) {
        // User is logged in, redirect to profile page
        authText.innerText = "Profile";
        authLink.setAttribute("href", "profile_page.html");
    } else {
        // User is not logged in, open sign-in modal
        authText.innerText = "Sign In";
        authLink.setAttribute("href", "#signin-modal");
        authLink.setAttribute("data-toggle", "modal");
    }
});



document.addEventListener("DOMContentLoaded", function () {
    const apiUrl = "http://localhost:8000/api/cart/";
    const cartTableBody = document.querySelector(".cart-items tbody");
    const subtotalElement = document.querySelector(".summary-subtotal td:nth-child(2)");
    const totalElement = document.querySelector(".summary-total td:nth-child(2)");

    // Get token from localStorage
    const token = localStorage.getItem("token");

    // Function to fetch cart data
    async function fetchCart() {
        try {
            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`, // Include token in headers
                    "Content-Type": "application/json"
                }
            });

            if (response.status === 401) {
                Swal.fire({
                    icon: "warning",
                    title: "Session Expired",
                    text: "You need to log in again.",
                    confirmButtonText: "OK"
                }).then(() => {
                    window.location.href = "index.html"; // Redirect to login page
                });
                return;
            }

            if (!response.ok) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Failed to fetch cart data. Please try again later.",
                    confirmButtonText: "OK"
                }).then(() => {
                    window.location.href = "index.html"; // Redirect to home page
                });
                return;
            }

            const data = await response.json();
            updateCartUI(data);
        } catch (error) {
            console.error("Error:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Something went wrong. Please try again later.",
            confirmButtonText: "OK"
        });
        }
    }

    // Function to update cart UI
    function updateCartUI(cartData) {
        cartTableBody.innerHTML = ""; // Clear current cart items

        cartData.cart_items.forEach((item) => {
            const row = document.createElement("tr");
            row.innerHTML = `
												<td class="product-col">
													<div class="product">
														<figure class="product-media">
															<a href="#">
																<img src="${item.product.image}" alt="${item.product.name}">
															</a>
														</figure>
	
														<h3 class="product-title">
															<a href="#">${item.product.name}</a>
														</h3><!-- End .product-title -->
													</div><!-- End .product -->
												</td>
												<td class="price-col">${item.product.price} /-</td>
												<td class="quantity-col">
                    <input type="number" class="form-control quantity-input" data-id="${item.id}" value="${item.quantity}" min="1" max="${item.product.available_quantity}">
                </td>
												<td class="total-col">Rs ${item.total_price}</td>
												<td class="remove-col">
                    <button class="btn-remove" data-id="${item.id}"><i class="icon-close"></i></button>
                </td>
            `;
            cartTableBody.appendChild(row);
        });

        // Update total price
        subtotalElement.textContent = `Rs ${cartData.total_cart_price}`;
        totalElement.textContent = `Rs ${cartData.total_cart_price}`;

        // Add event listeners for quantity change and remove
        document.querySelectorAll(".quantity-input").forEach(input => {
            input.addEventListener("change", updateQuantity);
        });

        document.querySelectorAll(".btn-remove").forEach(button => {
            button.addEventListener("click", removeItem);
        });
    }

    // Function to update quantity
    async function updateQuantity(event) {
        const itemId = event.target.dataset.id; // Ensure correct ID is fetched
        const newQuantity = event.target.value;

        if (!itemId) {
            console.error("Item ID is undefined");
            return;
        }

        try {
            await fetch(`http://localhost:8000/api/cart/update/${itemId}/`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ quantity:  newQuantity,}) 
            });
            fetchCart(); // Refresh cart data
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    }

    // Function to remove item
    async function removeItem(event) {
        const itemId = event.target.closest(".btn-remove").dataset.id; // Ensure correct ID is fetched

        if (!itemId) {
            console.error("Item ID is undefined");
            return;
        }

        try {
            await fetch(`http://localhost:8000/api/cart/remove/${itemId}/`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            fetchCart(); // Refresh cart data
        } catch (error) {
            console.error("Error removing item:", error);
        }
    }

    // Initial fetch
    fetchCart();
});

document
  .getElementById("show-password")
  .addEventListener("change", function () {
    var passwordField = document.getElementById("singin-password");
    passwordField.type = this.checked ? "text" : "password";
  });


  document.getElementById("show-register-password").addEventListener("change", function() {
    var passwordField = document.getElementById("register-password");
    passwordField.type = this.checked ? "text" : "password";
});
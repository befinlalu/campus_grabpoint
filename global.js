// API Base URL
var api = "http://localhost:8000/api";

// Registration Form Submission
document
  .getElementById("registration-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission

    // Collect form data
    const formData = {
      full_name: document.getElementById("register-name").value,
      username: document.getElementById("register-no").value,
      email: document.getElementById("register-email").value,
      password: document.getElementById("register-password").value,
    };

    // Show loading alert
    Swal.fire({
      title: "Registering...",
      text: "Please wait while we create your account.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await fetch(`${api}/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json(); // Parse JSON response

      if (response.ok) {
        // Successful registration
        Swal.fire({
          icon: "success",
          title: "Registration Successful",
          text: "Your account has been created successfully!",
          confirmButtonText: "OK",
        }).then(() => {
          document.getElementById("register-name").value = "";
          document.getElementById("register-no").value = "";
          document.getElementById("register-email").value = "";
          document.getElementById("register-password").value = "";
        });
      } else if (response.status === 400) {
        // Handle validation errors
        const emailError = data.email ? data.email.join(" ") : null;
        const usernameError = data.username ? data.username.join(" ") : null;
        const errorMessage =usernameError || emailError || "Error trying to register";

        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: errorMessage,
          confirmButtonText: "Try Again",
        });
      } else {
        // Handle other errors
        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: "Something went wrong. Please try again later.",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again later.",
        confirmButtonText: "OK",
      });
    }
  });


// Login Form Submission
document
  .getElementById("login-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent form from refreshing

    // Collect input values
    const formData = {
      username: document.getElementById("singin-email").value, // Assuming Admission No is the username
      password: document.getElementById("singin-password").value,
    };

    // Show loading alert
    Swal.fire({
      title: "Logging in...",
      text: "Please wait while we verify your credentials.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await fetch(`${api}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access);

        Swal.fire({
          icon: "success",
          title: "Login Successful",
          text: "Welcome back!",
          confirmButtonText: "OK",
        }).then(() => {
          window.location.href = "index.html"; // Redirect after success
        });
      } else {
        let errorMessage = data.detail
          ? data.detail
          : data.message || "Invalid Admission No or Password!";
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: errorMessage,
          confirmButtonText: "Try Again",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again later.",
        confirmButtonText: "OK",
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
  const productsContainer = document.querySelector(".products .row");
  const moreContainer = document.querySelector(".more-container");

  async function fetchProducts() {
    productsContainer.innerHTML = `<div class="text-center w-100"><p>Loading products...</p></div>`;

    try {
      const response = await fetch("http://localhost:8000/api/products/");

      if (!response.ok) throw new Error("Failed to fetch products");

      const products = await response.json();
      productsContainer.innerHTML = "";

      products.forEach((product) => {
        const isOutOfStock =
          !product.available_quantity || product.available_quantity <= 0;

        const productHTML = `
                    <div class="col-6 col-md-4 col-lg-3 col-xl-5col">
                        <div class="product product-7 text-center">
                            <figure class="product-media">
                                <a href="product.html?id=${product.id}">
                                    <img src="${product.image}" alt="${
          product.name
        }" class="product-image" 
                                        style="max-width: 200px; max-height: 200px; object-fit: contain;">
                                </a>
                                <div class="product-action">
                                    ${
                                      isOutOfStock
                                        ? `<button class="btn-product btn-cart disabled" disabled>
                                            <span>Sold Out</span>
                                        </button>`
                                        : `<a href="#" class="btn-product btn-cart" data-id="${product.id}">
                                            <span>Add to Cart</span>
                                        </a>`
                                    }
                                </div>
                            </figure>
                            <div class="product-body">
                                <h3 class="product-title">
                                    <a href="product.html?id=${product.id}">${
          product.name
        }</a>
                                </h3>
                                <div class="product-price">
                                    ${
                                      product.sale_price
                                        ? `<span class="new-price">Rs ${product.sale_price}</span> 
                                         <span class="old-price">Rs ${product.price}</span>`
                                        : `<span class="new-price">Rs ${product.price}</span>`
                                    }
                                </div>
                                <div class="ratings-container">
                                    <span class="ratings-text">
                                        Available: ${
                                          product.available_quantity || 0
                                        } items
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
        productsContainer.innerHTML += productHTML;
      });

      moreContainer.innerHTML = "";
    } catch (error) {
      console.error("Error fetching products:", error);
      productsContainer.innerHTML = `<div class="text-center w-100"><p>Failed to load products.</p></div>`;
      moreContainer.innerHTML = `<button class="btn btn-outline-dark-3" id="reload-btn">
                                        <span>Reload Products</span><i class="icon-refresh"></i>
                                       </button>`;
      document
        .getElementById("reload-btn")
        .addEventListener("click", fetchProducts);
    }
  }

  fetchProducts();

  productsContainer.addEventListener("click", function (event) {
    if (
      event.target.closest(".btn-cart") &&
      !event.target.closest(".btn-cart").classList.contains("disabled")
    ) {
      event.preventDefault();
      const button = event.target.closest(".btn-cart");
      addToCart(button);
    }
  });

  async function addToCart(button) {
    const productId = button.getAttribute("data-id");

    if (!productId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Invalid product. Please try again.",
        confirmButtonText: "OK",
      });
      return;
    }

    Swal.fire({
      title: "Adding to Cart...",
      text: "Please wait...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await fetch("http://localhost:8000/api/cart/add/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ product_id: parseInt(productId), quantity: 1 }),
      });

      const data = await response.json();
      Swal.close();

      if (response.status === 401) {
        localStorage.removeItem("token"); // Clear token
        Swal.fire({
          icon: "warning",
          title: "Session Expired",
          text: "Your session has expired. Please log in again.",
          confirmButtonText: "OK",
        }).then(() => {
          window.location.href = "index.html"; // Redirect to login
        });
        return;
      }

      if (response.ok) {
        fetchCartData();
        Swal.fire({
          icon: "success",
          title: "Added to Cart",
          text: "Product successfully added to your cart!",
          confirmButtonText: "OK",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to Add",
          text: data.message || "Something went wrong!",
          confirmButtonText: "Try Again",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add to cart. Please try again later.",
        confirmButtonText: "OK",
      });
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  fetchCartData();
});

function fetchCartData() {
  const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
  if (!token) {
    console.warn("User is not logged in.");
    return;
  }

  fetch("http://localhost:8000/api/cart/", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.status === 401) {
        localStorage.removeItem("token"); // Clear token on unauthorized access
        alert("Session expired. Please log in again.");
        window.location.href = "index.html"; // Redirect to login page
        return;
      }
      return response.json();
    })
    .then((data) => {
      if (!data || !data.cart_items) {
        console.warn("No cart data found.");
        return;
      }
      updateCartDropdown(data);
    })
    .catch((error) => console.error("Error fetching cart data:", error));
}

function updateCartDropdown(cartData) {
  const cartDropdown = document.querySelector(".dropdown-cart-products");
  const cartTotalPrice = document.querySelector(".cart-total-price");
  const cartCount = document.querySelector(".cart-count");

  cartDropdown.innerHTML = ""; // Clear existing items

  if (cartData.cart_items.length === 0) {
    cartDropdown.innerHTML = `<p class="text-center p-2">Your cart is empty.</p>`;
    cartTotalPrice.textContent = "$0.00";
    cartCount.textContent = "0";
    return;
  }

  let totalItems = 0;
  cartData.cart_items.forEach((item) => {
    totalItems += item.quantity;
    cartDropdown.innerHTML += `
            <div class="product">
                <div class="product-cart-details">
                    <h4 class="product-title">
                        <a href="product.html?id=${item.product.id}">${item.product.name}</a>
                    </h4>
                    <span class="cart-product-info">
                        <span class="cart-product-qty">${item.quantity}</span> x Rs ${item.product.price}
                    </span>
                </div>
                <figure class="product-image-container">
                    <a href="product.html?id=${item.product.id}" class="product-image">
                        <img src="${item.product.image}" alt="${item.product.name}">
                    </a>
                </figure>
            </div>
        `;
  });

  cartTotalPrice.textContent = `$${cartData.total_cart_price.toFixed(2)}`;
  cartCount.textContent = totalItems;

  attachRemoveListeners();
}

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
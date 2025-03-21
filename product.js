
document.addEventListener("DOMContentLoaded", function () {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    if (productId) {
        fetchProductDetails(productId);
        fetchProductReviews(productId);
    } else {
        alert("Product ID not found!");
    }
});



document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    const apiUrl = `http://localhost:8000/api/products/${productId}/rating-summary/`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.average_rating !== undefined && data.total_ratings !== undefined) {
                // Calculate percentage for rating bar (assuming 5 is max rating)
                const ratingPercentage = (data.average_rating / 5) * 100;
                
                // Update the rating bar width
                document.querySelector(".ratings-val").style.width = `${ratingPercentage}%`;

                // Update the total reviews count
                document.querySelector("#review-link").innerText = `(${data.total_ratings} Reviews)`;
            }
        })
        .catch(error => console.error("Error fetching rating data:", error));
});



function fetchProductDetails(productId) {
    fetch(`http://localhost:8000/api/products/${productId}/`)
        .then(response => response.json())
        .then(product => {
            document.querySelector(".product-title").textContent = product.name;
            document.querySelector("#product-zoom").src = product.image;
            document.querySelector("#product-zoom").setAttribute("data-zoom-image", product.image);
            document.querySelector(".product-price").textContent = `Rs ${product.price}`;
            document.querySelector(".product-content p").textContent = product.short_description;
            document.querySelector(".product-cat a").textContent = product.category.name;
            document.querySelector("#qty").max = product.available_quantity;
            document.querySelector(".full-description").textContent = product.full_description;
        })
        .catch(error => console.error("Error fetching product details:", error));
}


function fetchProductReviews(productId) {
    fetch(`http://localhost:8000/api/products/${productId}/ratings/`)
        .then(response => response.json())
        .then(reviews => {
            const reviewContainer = document.querySelector(".reviews");
            reviewContainer.innerHTML = ""; // Clear previous reviews
            
            if (reviews.length === 0) {
                reviewContainer.innerHTML = "<p>No reviews yet.</p>";
                return;
            }

            reviews.forEach(review => {
                const reviewElement = `
                    <div class="review">
                        <div class="row no-gutters">
                            <div class="col-auto">
                                <h4><a href="#">${review.user.full_name}</a></h4>
                                <div class="ratings-container">
                                    <div class="ratings">
                                        <div class="ratings-val" style="width: ${review.rating * 20}%;"></div>
                                    </div>
                                </div>
                                <span class="review-date">${new Date(review.created_at).toLocaleDateString()}</span>
                            </div>
                            <div class="col">
                                <h4>${review.title}</h4>
                                <div class="review-content">
                                    <p>${review.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                reviewContainer.innerHTML += reviewElement;
            });
        })
        .catch(error => console.error("Error fetching reviews:", error));
}




document.getElementById("reviewForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    const rating = document.getElementById("starRating").value;
    const description = document.getElementById("reviewDescription").value;

    if (!rating) {
        Swal.fire({
            icon: "warning",
            title: "Missing Rating",
            text: "Please select a rating before submitting.",
        });
        return;
    }

    const reviewData = {
        product: productId,
        rating: parseInt(rating),
        description: description || "No description provided."
    };

    fetch("http://localhost:8000/api/ratings/add/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}` // Assuming token is stored in localStorage
        },
        body: JSON.stringify(reviewData)
    })
    .then(response => {
        if (response.status === 401) {
            throw new Error("session_expired");
        }
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.detail || "Something went wrong!");
            });
        }
        return response.json();
    })
    .then(data => {
        Swal.fire({
            icon: "success",
            title: "Review Submitted!",
            text: "Thank you for your feedback.",
        });
        document.getElementById("reviewForm").reset(); // Clear form
        fetchProductReviews(productId); // Refresh reviews (if implemented)
    })
    .catch(error => {
        if (error.message === "session_expired") {
            Swal.fire({
                icon: "warning",
                title: "Session Expired",
                text: "Your session has ended. Please log in again.",
                confirmButtonText: "Login",
                allowOutsideClick: false
            }).then(() => {
                window.location.href = "index.html"; // Redirect to login page
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message || "Failed to submit the review.",
            });
        }
        console.error("Error submitting review:", error);
    });
});




document.getElementById("addto-cart").addEventListener("click", function (event) {
    event.preventDefault(); // Prevent default link behavior

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    const quantity = document.getElementById("qty").value;

    if (!productId || quantity < 1) {
        Swal.fire({
            icon: "warning",
            title: "Invalid Quantity",
            text: "Please enter a valid quantity.",
        });
        return;
    }

    const cartData = {
        product_id: parseInt(productId),
        quantity: parseInt(quantity),
    };

    fetch("http://localhost:8000/api/cart/add/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`, // Assuming token is stored in localStorage
        },
        body: JSON.stringify(cartData),
    })
    .then(response => {
        if (response.status === 401) {
            throw new Error("session_expired");
        }
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.detail || "Something went wrong!");
            });
        }
        return response.json();
    })
    .then(data => {
        Swal.fire({
            icon: "success",
            title: "Added to Cart!",
            text: "Your item has been added successfully.",
        });

        fetchCartData();
    })
    .catch(error => {
        if (error.message === "session_expired") {
            Swal.fire({
                icon: "warning",
                title: "Session Expired",
                text: "Your session has ended. Please log in again.",
                confirmButtonText: "Login",
                allowOutsideClick: false,
            }).then(() => {
                window.location.href = "index.html"; // Redirect to login page
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message || "Failed to add item to cart.",
            });
        }
        console.error("Error adding to cart:", error);
    });
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
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    })
    .then(response => {
        if (response.status === 401) {
            localStorage.removeItem("token"); // Clear token on unauthorized access
            alert("Session expired. Please log in again.");
            window.location.href = "index.html"; // Redirect to login page
            return;
        }
        return response.json();
    })
    .then(data => {
        if (!data || !data.cart_items) {
            console.warn("No cart data found.");
            return;
        }
        updateCartDropdown(data);
    })
    .catch(error => console.error("Error fetching cart data:", error));
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
    cartData.cart_items.forEach(item => {
        totalItems += item.quantity;
        cartDropdown.innerHTML += `
            <div class="product">
                <div class="product-cart-details">
                    <h4 class="product-title">
                        <a href="product.html?id=${item.product.id}">${item.product.name}</a>
                    </h4>
                    <span class="cart-product-info">
                        <span class="cart-product-qty">${item.quantity}</span> x $${item.product.price}
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

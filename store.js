document.addEventListener("DOMContentLoaded", function () {
    const productsContainer = document.querySelector(".products-store .row");
    const moreContainer = document.querySelector(".more-container");
    const categoriesContainer = document.querySelector(".filter-items");

    if (!categoriesContainer) {
        console.error("Error: Category filter container not found!");
        return;
    }

    async function fetchCategories() {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/categories/");
            if (!response.ok) throw new Error("Failed to fetch categories");

            const categories = await response.json();
            categoriesContainer.innerHTML = ""; // Clear old data

            categories.forEach(category => {
                const categoryHTML = `
                    <div class="filter-item">
                        <div class="custom-control custom-checkbox">
                            <input type="checkbox" class="custom-control-input category-checkbox" 
                                   id="cat-${category.id}" data-id="${category.id}">
                            <label class="custom-control-label" for="cat-${category.id}">${category.name}</label>
                        </div>
                    </div>
                `;
                categoriesContainer.innerHTML += categoryHTML;
            });

            // Attach event listener to dynamically added checkboxes
            attachCategoryFilterListener();
        } catch (error) {
            console.error("Error fetching categories:", error);
            categoriesContainer.innerHTML = `<p class="text-danger">Failed to load categories.</p>`;
        }
    }

    fetchCategories();

    async function fetchProducts(categoryIds = []) {
        productsContainer.innerHTML = `<div class="text-center w-100"><p>Loading products...</p></div>`;
    
        try {
            let apiUrl = "http://localhost:8000/api/products/";
            
            if (categoryIds && categoryIds.length > 0) {
                apiUrl += `?category_id=${categoryIds.join(",")}`;
            }
    
            const response = await fetch(apiUrl);
    
            if (!response.ok) throw new Error("Failed to fetch products");
    
            const products = await response.json();
            productsContainer.innerHTML = "";
    
            products.forEach(product => {
                const isOutOfStock = !product.available_quantity || product.available_quantity <= 0;
    
                const productHTML = `
                    <div class="col-6 col-md-4 col-lg-4">
                        <div class="product product-7 text-center">
                            <figure class="product-media d-flex justify-content-center">
                                <a href="product.html?id=${product.id}">
                                    <img src="${product.image}" alt="${product.name}" class="product-image" 
                                        style="max-width: 200px; max-height: 200px; object-fit: contain;">
                                </a>
                                <div class="product-action">
                                    ${isOutOfStock ? 
                                        `<button class="btn-product btn-cart disabled" disabled>
                                            <span>Sold Out</span>
                                        </button>` :
                                        `<a href="#" class="btn-product btn-cart" data-id="${product.id}">
                                            <span>Add to Cart</span>
                                        </a>`
                                    }
                                </div>
                            </figure>
                            <div class="product-body">
                                <h3 class="product-title">
                                    <a href="product.html?id=${product.id}">${product.name}</a>
                                </h3>
                                <div class="product-price">
                                    ${product.sale_price ? 
                                        `<span class="new-price">Rs${product.sale_price}</span> 
                                         <span class="old-price">Rs${product.price}</span>` :
                                        `<span class="new-price">Rs${product.price}</span>`
                                    }
                                </div>
                                <div class="ratings-container">
                                    <span class="ratings-text">
                                        Available: ${product.available_quantity || 0} items
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
            document.getElementById("reload-btn").addEventListener("click", () => fetchProducts(categoryIds));
        }
    }
    

    fetchProducts();


    function attachCategoryFilterListener() {
        document.querySelectorAll(".category-checkbox").forEach(checkbox => {
            checkbox.addEventListener("change", function () {
                const selectedCategories = Array.from(
                    document.querySelectorAll(".category-checkbox:checked")
                ).map(cb => parseInt(cb.getAttribute("data-id"), 10)); // Convert to integer

                fetchProducts(selectedCategories);
            });
        });
    }

    productsContainer.addEventListener("click", function (event) {
        if (event.target.closest(".btn-cart") && !event.target.closest(".btn-cart").classList.contains("disabled")) {
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
                confirmButtonText: "OK"
            });
            return;
        }
    
        Swal.fire({
            title: "Adding to Cart...",
            text: "Please wait...",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    
        try {
            const response = await fetch("http://localhost:8000/api/cart/add/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}` 
                },
                body: JSON.stringify({ product_id: parseInt(productId), quantity: 1 }) 
            });

            const data = await response.json();
            Swal.close();

            if (response.status === 401) {
                localStorage.removeItem("token"); // Clear token
                Swal.fire({
                    icon: "warning",
                    title: "Session Expired",
                    text: "Your session has expired. Please log in again.",
                    confirmButtonText: "OK"
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
                    confirmButtonText: "OK"
                });

            } else {
                Swal.fire({
                    icon: "error",
                    title: "Failed to Add",
                    text: data.message || "Something went wrong!",
                    confirmButtonText: "Try Again"
                });
            }
        } catch (error) {
            console.error("Error:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to add to cart. Please try again later.",
                confirmButtonText: "OK"
            });
        }
    }
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


document.addEventListener("DOMContentLoaded", function () {
   

    
});






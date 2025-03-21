document.addEventListener("DOMContentLoaded", function () {
    fetchCartData();
});

async function fetchCartData() {
        // Get token from localStorage
        const token = localStorage.getItem("token");
    try {
        const response = await fetch('http://localhost:8000/api/cart/', {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`, // Include token in headers
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) {
            if (response.status === 401) {
                Swal.fire({
                    icon: "error",
                    title: "Unauthorized",
                    text: "Please log in to proceed.",
                    confirmButtonText: "OK",
                }).then(() => {
                    window.location.href = "index.html";
                });
                return;
            }
            throw new Error("Failed to fetch cart data");
        }
        const cartData = await response.json();
        console.log("Cart Data:", cartData);

        // Extract cart_items array
        const cartItems = cartData.cart_items || [];

        // Call function to update the table
        updateCartTable(cartItems, cartData.total_cart_price);
    } catch (error) {
        console.error(error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Something went wrong. Please try again later.",
        }).then(() => {
            // window.location.href = "index.html";
        });
    }
}

function updateCartTable(cartItems, totalCartPrice) {
    const tableBody = document.querySelector(".table-summary tbody");
    tableBody.innerHTML = ""; // Clear existing content

    cartItems.forEach((item) => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td><a href="#">${item.product.name}</a> x ${item.quantity}</td>
            <td>Rs ${item.total_price}</td>
        `;
        tableBody.appendChild(row);
    });

    // Add subtotal row
    let subtotalRow = document.createElement("tr");
    subtotalRow.classList.add("summary-subtotal");
    subtotalRow.innerHTML = `
        <td>Subtotal:</td>
        <td>Rs ${totalCartPrice.toFixed(2)}</td>
    `;
    tableBody.appendChild(subtotalRow);

    // Add total row
    let totalRow = document.createElement("tr");
    totalRow.classList.add("summary-total");
    totalRow.innerHTML = `
        <td>Total:</td>
        <td>Rs ${totalCartPrice.toFixed(2)}</td>
    `;
    tableBody.appendChild(totalRow);
}


document.getElementById("check-out-form").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent page reload
    const token = localStorage.getItem("token");
    // Get input values
    let inputs = document.querySelectorAll(".form-control");

    let firstName = inputs[0].value; // First Name
    let lastName = inputs[1].value;  // Last Name
    let registrationNo = inputs[2].value; // Register No
    let phoneNumber = inputs[3].value; // Phone Number
    let email = inputs[4].value; // Email
    let note = document.querySelector("textarea").value; // Order Notes
    // Construct order payload (updated format)
    let orderData = {
        payment_status: "cod", // Change based on selected payment method
        order_address: {
            first_name: firstName,
            last_name: lastName,
            registration_no: registrationNo,
            phone_number: phoneNumber,
            email: email,
            note: note
        }
    };

    // Send data to backend
    try {
        let response = await fetch("http://localhost:8000/api/checkout/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`, // Include token in headers
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        });

        let result = await response.json();

        if (response.ok) {
            Swal.fire({
                icon: "success",
                title: "Order Placed!",
                text: "Your order has been placed successfully.",
                confirmButtonText: "OK"
            }).then(() => {
                window.location.href = "orders.html"; // Redirect to success page
            });
        } else if (response.status === 401) {
            Swal.fire({
                icon: "warning",
                title: "Session Expired",
                text: "Your session has expired. Please log in again.",
                confirmButtonText: "OK"
            }).then(() => {
                window.location.href = "index.html"; // Redirect to login page
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Order Failed",
                text: result.message || "An error occurred while placing your order.",
                confirmButtonText: "Try Again"
            });
        }
    } catch (error) {
        console.error("Checkout error:", error);
        Swal.fire({
            icon: "error",
            title: "Network Error",
            text: "An error occurred. Please check your connection and try again.",
            confirmButtonText: "OK"
        });
    }
});

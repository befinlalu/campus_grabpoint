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


document.addEventListener("DOMContentLoaded", async function () {
    const orderHistoryContainer = document.getElementById("order-history");

    try {
        const token = localStorage.getItem("token"); // Get token from localStorage

        if (!token) {
            orderHistoryContainer.innerHTML = "<p>Unauthorized: Please log in.</p>";
            return;
        }

        const response = await fetch("http://localhost:8000/api/orders/", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`, // Add token to request headers
                "Content-Type": "application/json"
            }
        });

        if (response.status === 401) {
            Swal.fire({
                icon: "error",
                title: "Session Expired",
                text: "Your session has expired. Please log in again.",
                confirmButtonText: "OK"
            }).then(() => {
                window.location.href = "index.html"; // Redirect to login page
            });
            return;
        }

        const orders = await response.json();

        if (orders.length === 0) {
            orderHistoryContainer.innerHTML = "<p>No orders found.</p>";
            return;
        }

        let ordersHTML = "";
        orders.forEach(order => {
            const orderDate = new Date(order.created_at).toLocaleDateString();
            const statusClass = order.status === "pending" ? "text-warning" : "text-success";

            let itemsHTML = "";
            order.items.forEach(item => {
                itemsHTML += `
                    <tr>
                        <td>${item.product}</td>
                        <td>Rs ${item.price}</td>
                        <td>${item.quantity}</td>
                        <td>Rs ${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                    </tr>`;
            });

            ordersHTML += `
                <div class="order-item border p-3 mb-4">
                    <h4>Order #${order.id}</h4>
                    <p><strong>Date:</strong> ${orderDate}</p>
                    <p><strong>Status:</strong> <span class="${statusClass}">${order.status}</span></p>
                    <p><strong>Total Price:</strong> Rs ${order.total_price}</p>
                    
                    <h5>Items:</h5>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHTML}
                        </tbody>
                    </table>

                    <h5>Customer Details:</h5>
                    <p><strong>Name:</strong> ${order.order_address.first_name} ${order.order_address.last_name}</p>
                    <p><strong>Phone:</strong> ${order.order_address.phone_number}</p>
                    <p><strong>Email:</strong> ${order.order_address.email}</p>
                    <p><strong>Note:</strong> ${order.order_address.note}</p>
                </div>`;
        });

        orderHistoryContainer.innerHTML = ordersHTML;

    } catch (error) {
        console.error("Error fetching orders:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to load orders. Please try again later.",
            confirmButtonText: "OK"
        });
    }
});


document.addEventListener("DOMContentLoaded", async function () {
    const authToken = localStorage.getItem("token");

    // Function to fetch and display print order history
    async function fetchPrintOrderHistory() {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/print-orders/view/", {
                headers: {
                    "Authorization": `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch print orders");
            }

            const printOrders = await response.json();
            const printOrderContainer = document.getElementById("print-order-history");

            printOrders.forEach(order => {
                const orderDate = new Date(order.created_at).toLocaleString();
                const statusClass = order.status === "pending" ? "text-warning" : "text-success";

                // Generate file links
                const filesHTML = order.files.map(file => {
                    const fileName = file.file.split('/').pop();
                    const fileExtension = fileName.split('.').pop().toLowerCase();
                
                    // Determine icon based on file type
                    let fileIcon;
                    if (fileExtension === "pdf") {
                        fileIcon = '<i class="fas fa-file-pdf text-danger"></i>';
                    } else if (["doc", "docx"].includes(fileExtension)) {
                        fileIcon = '<i class="fas fa-file-word text-primary"></i>';
                    } else if (["xls", "xlsx"].includes(fileExtension)) {
                        fileIcon = '<i class="fas fa-file-excel text-success"></i>';
                    } else {
                        fileIcon = '<i class="fas fa-file-alt text-secondary"></i>'; // Generic file icon
                    }
                
                    return `
                        <p>${fileIcon} <a href="${file.file}" target="_blank">${fileName}</a></p>
                    `;
                }).join("");
                

                const orderHTML = `
                    <div class="order-item border p-3 mb-4">
                        <h4>Print Order #${order.id}</h4>
                        <p><strong>Date:</strong> ${orderDate}</p>
                        <p><strong>Status:</strong> <span class="${statusClass}">${order.status}</span></p>
                        <p><strong>Total Price:</strong> Rs ${order.total_price}</p>

                        <h5>Files:</h5>
                        ${filesHTML}

                        <h5>Print Details:</h5>
                        <p><strong>Paper Size:</strong> ${order.paper_size}</p>
                        <p><strong>Color Mode:</strong> ${order.color_mode}</p>
                        <p><strong>Print Sides:</strong> ${order.print_sides}</p>
                        <p><strong>Binding Option:</strong> ${order.binding_option}</p>
                        <p><strong>Urgency:</strong> ${order.urgency}</p>
                        <p><strong>Additional Notes:</strong> ${order.additional_notes}</p>
                    </div>
                `;

                printOrderContainer.insertAdjacentHTML("beforeend", orderHTML);
            });

        } catch (error) {
            console.error("Error fetching print order history:", error);
        }
    }

    // Call function to fetch print order history
    fetchPrintOrderHistory();
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
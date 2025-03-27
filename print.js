
document.getElementById('fileUpload').addEventListener('change', function(event) {
    const fileList = event.target.files;
    const previewContainer = document.getElementById('filePreviewRow');
    previewContainer.innerHTML = '';

    if (fileList.length > 5) {
        alert("You can only upload up to 5 files.");
        return;
    }

    Array.from(fileList).forEach((file, index) => {
        if (!file.type.includes("pdf") && !file.type.includes("msword")) {
            alert("Only PDF and DOC files are allowed.");
            return;
        }

        const fileURL = URL.createObjectURL(file);
        const fileItem = document.createElement('div');
        fileItem.className = "col-md-2 text-center position-relative uploaded-file";

        fileItem.innerHTML = `
            <button type="button" class="remove-file" data-index="${index}">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <a href="${fileURL}" target="_blank" class="text-decoration-none d-block">
                <i class="fa-solid fa-file-alt text-secondary"></i>
                <p class="small mb-0 text-truncate">${file.name}</p>
            </a>
        `;
        previewContainer.appendChild(fileItem);
    });

    // Remove file button logic
    document.querySelectorAll('.remove-file').forEach(button => {
        button.addEventListener('click', function() {
            this.parentElement.remove();
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const numPages = document.getElementById("numPages");
    const numCopies = document.getElementById("numCopies");
    const colorMode = document.getElementById("colorMode");
    const printSides = document.getElementById("printSides");
    const bindingOption = document.getElementById("bindingOption");
    const urgency = document.getElementById("urgency");
    const totalPriceEl = document.getElementById("totalPrice");
    const priceBreakdownEl = document.getElementById("priceBreakdown");

    function calculatePrice() {
        const pages = parseInt(numPages.value) || 1;
        const copies = parseInt(numCopies.value) || 1;

        // ✅ Set price per page based on color mode
        let colorPrice = colorMode.value === "color" ? 5 : 2;

        // ✅ Set multiplier for single/double-sided
        let sideMultiplier = printSides.value === "double" ? 1.5 : 1;

        // ✅ Paper size doesn't affect cost, so no multiplier needed
        let paperMultiplier = 1;

        // ✅ Set binding cost
        let bindingCost = bindingOption.value === "spiral" ? 30 :"none" ? 0: 10;

        // ✅ Set urgency multiplier
        let urgencyMultiplier = urgency.value === "express" ? 1.2 : 1;

        // ✅ Calculate base cost
        let baseCost = pages * colorPrice * sideMultiplier * copies * paperMultiplier;

        // ✅ Calculate total cost with binding and urgency
        let totalCost = (baseCost + bindingCost) * urgencyMultiplier;

        // ✅ Update UI
        totalPriceEl.textContent = `Rs ${totalCost.toFixed(2)}`;
        priceBreakdownEl.innerHTML = `
            <small>
                (${pages} pages × Rs ${colorPrice}/page × ${copies} copies × ${sideMultiplier}x sides)
                + Rs ${bindingCost} binding × ${urgencyMultiplier}x urgency = <strong>Rs ${totalCost.toFixed(2)}</strong>
            </small>
        `;
    }

    // ✅ Attach event listeners
    [numPages, numCopies, colorMode, printSides, bindingOption, urgency].forEach(input => {
        input.addEventListener("input", calculatePrice);
    });

    // ✅ Initial calculation on page load
    calculatePrice();
});

			
            document.getElementById("checkout").addEventListener("click", async function () {
                const fileInput = document.getElementById("fileUpload");
                
                // Ensure at least one file is uploaded
                if (fileInput.files.length === 0) {
                    Swal.fire({
                        icon: "warning",
                        title: "No Files Uploaded",
                        text: "Please upload at least one document before proceeding."
                    });
                    return;
                }
            
                // Get form values
                const paperSize = document.getElementById("paperSize").value;
                const colorMode = document.getElementById("colorMode").value;
                const printSides = document.getElementById("printSides").value;
                const bindingOption = document.getElementById("bindingOption").value;
                const urgency = document.getElementById("urgency").value;
                const additionalNotes = document.querySelector("textarea").value;
                const transactionInput = document.getElementById('transactionId').value;
                const totalPrice = document.getElementById("totalPrice").textContent.replace("Rs ", "").trim();
                let paymentStatus = "cod"; // Hardcoded as per your data
                let codSelected = document.querySelector('#collapse-3').classList.contains("show");
                let upiSelected = document.querySelector('#collapse-2').classList.contains("show");

                if (!codSelected && !upiSelected) {
                    Swal.fire({
                        icon: "error",
                        title: "Payment Error",
                        text: "Please select a payment method before submitting.",
                    });
                    return;
                }
            
                if (upiSelected) {
                    paymentStatus = "upi"; // Set payment status
                    if (transactionInput === "") {
                        transactionIdError.classList.remove("d-none"); // Show error below input field
                        Swal.fire({
                            icon: "error",
                            title: "Transaction ID Required",
                            text: "Please enter a Transaction ID for UPI payment.",
                        });
                        return;
                    }
                } else if (codSelected) {
                    paymentStatus = "cod";
                }
            
                // Create FormData
                const formData = new FormData();
                
                // Append files
                for (let i = 0; i < fileInput.files.length; i++) {
                    formData.append("files", fileInput.files[i]);
                }
            
                // Append text fields
                formData.append("paper_size", paperSize);
                formData.append("color_mode", colorMode);
                formData.append("print_sides", printSides);
                formData.append("binding_option", bindingOption);
                formData.append("urgency", urgency);
                formData.append("additional_notes", additionalNotes);
                formData.append("total_price", totalPrice);
                formData.append("payment_status", paymentStatus);
                formData.append("transaction_id", transactionInput);
            
                try {
                    // Get auth token from local storage
                    const authToken = localStorage.getItem("token");
            
                    const response = await fetch("http://127.0.0.1:8000/api/print-orders/", {
                        method: "POST",
                        body: formData,
                        headers: {
                            "Authorization": `Bearer ${authToken}`, // Attach Authorization token

                        },
                    });
            
                    if (response.ok) {
                        Swal.fire({
                            icon: "success",
                            title: "Order Placed!",
                            text: "Your print order has been placed successfully.",
                            confirmButtonText: "OK"
                        }).then(() => {
                            window.location.href = "print.html"; // Redirect to print.html
                        });
                    } else if (response.status === 401) {
                        Swal.fire({
                            icon: "error",
                            title: "Session Expired",
                            text: "Your session has expired. Please log in again.",
                            confirmButtonText: "OK"
                        }).then(() => {
                            window.location.href = "index.html"; // Redirect to login page
                        });
                    } else {
                        const errorData = await response.json();
                        Swal.fire({
                            icon: "error",
                            title: "Error!",
                            text: errorData.message || "Something went wrong. Please try again."
                        });
                    }
                } catch (error) {
                    console.error("Error:", error);
                    Swal.fire({
                        icon: "error",
                        title: "Network Error",
                        text: "Failed to send order. Please check your connection and try again."
                    });
                }
            });
            // Function to toggle transaction ID requirement based on payment method
function toggleTransactionId(requireTransactionId) {
    let transactionInput = document.getElementById("transactionId");
    if (requireTransactionId) {
        transactionInput.setAttribute("required", "true");
    } else {
        transactionInput.removeAttribute("required");
    }
}

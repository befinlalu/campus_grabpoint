document.getElementById("forgot-password-form").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission

    const regNo = document.getElementById("reg_no").value.trim();
    const email = document.getElementById("email").value.trim();
    const newPassword = document.getElementById("new_password").value.trim();
    const confirmPassword = document.getElementById("confirm_password").value.trim();

    // Validate password match
    if (newPassword !== confirmPassword) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Passwords do not match!",
        });
        return;
    }

    const requestData = {
        username: regNo,
        email: email,
        new_password: newPassword
    };

    try {
        const response = await fetch("http://localhost:8000/api/forgot-password/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        });

        const responseData = await response.json();

        if (response.ok) {
            Swal.fire({
                icon: "success",
                title: "Success!",
                text: responseData.message || "Password changed successfully.",
            }).then(() => {
                document.getElementById("forgot-password-form").reset(); // Reset form
                window.location.href = "index.html";
            });
        } else {
            throw new Error(responseData.message || "Failed to reset password.");
        }
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error!",
            text: error.message,
        });
    }
});

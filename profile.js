


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


document.addEventListener("DOMContentLoaded", async function() {
    try {
        const authToken = localStorage.getItem("token");
        const response = await fetch("http://localhost:8000/api/user-details/", {
            headers: { "Authorization": `Bearer ${authToken}` }
        });

        if (response.ok) {
            const userData = await response.json();
            document.getElementById("profileName").textContent = userData.full_name;
            document.getElementById("profileRegNo").textContent = `Admission No: ${userData.username}`;
            document.getElementById("profileEmail").textContent = userData.email;
        } else {
            window.location.href = "index.html"; // Redirect to login if unauthorized
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
    }
});

// Logout function
document.getElementById("logoutBtn").addEventListener("click", function() {
    localStorage.removeItem("token");
    window.location.href = "index.html"; // Redirect to login
});

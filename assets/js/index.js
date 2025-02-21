

        document.getElementById("showPassword").addEventListener("change", function () {
            let passwordField = document.getElementById("signin-password");
            passwordField.type = this.checked ? "text" : "password";
        });
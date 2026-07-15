const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "cloudfeedback2026";

if(sessionStorage.getItem("adminLoggedIn") === "true"){
    window.location.href = "admin.html";
}

const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");

loginForm.addEventListener("submit", (e) => {

    e.preventDefault();

    // Clear previous messages
    errorMessage.innerHTML = "";

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value.trim();

    if(
        username === ADMIN_USERNAME &&
        password === ADMIN_PASSWORD
    ){

        sessionStorage.setItem(
            "adminLoggedIn",
            "true"
        );

        errorMessage.style.color = "green";

        errorMessage.innerHTML =
            "✅ Login Successful! Redirecting...";

        setTimeout(() => {

            window.location.href = "admin.html";

        }, 1000);

    }
    else{

        errorMessage.style.color = "red";

        errorMessage.innerHTML =
            "❌ Invalid Username or Password";

    }

});
const API_URL = "https://tv705ibvdh.execute-api.us-east-1.amazonaws.com/prod/feedback";

const form = document.getElementById("feedbackForm");
const message = document.getElementById("message");

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    message.textContent = "";
    message.className = "";

    const submitButton = document.querySelector("button");

    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    const rollNumber = document.getElementById("rollNumber").value.trim();

    if (!/^[A-Za-z0-9]{1,12}$/.test(rollNumber)) {

        message.className = "error";
        message.textContent = "Roll Number must contain only letters and numbers (Maximum 12 characters).";

        submitButton.disabled = false;
        submitButton.textContent = "Submit Feedback";

        return;
    }

    const data = {
        studentName: document.getElementById("studentName").value.trim(),
        collegeName: document.getElementById("collegeName").value.trim(),
        rollNumber: rollNumber,
        email: document.getElementById("email").value.trim(),
        subject: document.getElementById("subject").value,
        rating: document.getElementById("rating").value,
        comments: document.getElementById("comments").value.trim()
    };

    try {

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {

            message.className = "success";
            message.textContent = "✅ Feedback submitted successfully!";

            form.reset();

        } else {

            message.className = "error";
            message.textContent = "❌ Submission failed.";

        }

    } catch (error) {

        console.error(error);

        message.className = "error";
        message.textContent = "❌ Unable to connect to the server.";

    }

    submitButton.disabled = false;
    submitButton.textContent = "Submit Feedback";

});
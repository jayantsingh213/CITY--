// Wait for the document to be fully loaded before running the script
document.addEventListener("DOMContentLoaded", function() {
    
    // Get the elements from the page
    const sendOtpBtn = document.getElementById("send-otp-btn");
    const phoneStep = document.getElementById("phone-step");
    const otpStep = document.getElementById("otp-step");
    const phoneInput = document.getElementById("phone");

    // Add a click event listener to the "Send OTP" button
    sendOtpBtn.addEventListener("click", function() {
        // Simple check to make sure the phone number field is not empty
        if (phoneInput.value.trim() !== "") {
            
            // --- In a real app, you would send the OTP to the server here ---
            console.log("Requesting OTP for: " + phoneInput.value);

            // Hide the phone number step
            phoneStep.style.display = "none";
            
            // Show the OTP entry step
            otpStep.style.display = "block";

        } else {
            alert("Please enter your phone number.");
        }
    });

    // You would add another event listener for the final form submission here
    // to verify the OTP with your backend.
});
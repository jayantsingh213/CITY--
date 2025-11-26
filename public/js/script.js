document.addEventListener('DOMContentLoaded', () => {

    // ===============================
    // 1. Mobile Menu Toggle
    // ===============================
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');
    const navOverlay = document.getElementById('nav-overlay');
    const body = document.getElementById('body');

    const closeMenu = () => {
        if (body.classList.contains('nav-open')) {
            body.classList.remove('nav-open');
            navToggle.setAttribute('aria-label', 'Open navigation');
        }
    };

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            body.classList.toggle('nav-open');
            if (body.classList.contains('nav-open')) {
                navToggle.setAttribute('aria-label', 'Close navigation');
            } else {
                navToggle.setAttribute('aria-label', 'Open navigation');
            }
        });
    }

    // Close menu when clicking overlay or a link
    if (navOverlay) navOverlay.addEventListener('click', closeMenu);
    if (navLinks) {
        navLinks.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') closeMenu();
        });
    }

    // ===============================
    // 2. File Upload Feedback (UX)
    // ===============================
    // Checks for either ID to be safe
    const fileUpload = document.getElementById('file-upload') || document.getElementById('photo-upload');
    const fileNameDisplay = document.getElementById('file-name-display');

    if (fileUpload && fileNameDisplay) {
        fileUpload.addEventListener('change', () => {
            if (fileUpload.files.length > 0) {
                // Display the name of the selected file
                fileNameDisplay.textContent = `File selected: ${fileUpload.files[0].name}`;
                fileNameDisplay.style.color = "#28a745"; // Optional: Green text for success
            } else {
                fileNameDisplay.textContent = '';
            }
        });
    }

    // ===============================
    // 3. Report Form Submission (Async)
    // ===============================
    const reportForm = document.getElementById('report-form');

    if (reportForm) {
        reportForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Stop the browser from reloading the page

            // A. Show Loading State
            const submitButton = reportForm.querySelector('button[type="submit"]');
            const originalBtnText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...'; // Added spinner icon

            // B. Prepare Data (FormData is required for files)
            const serverFormData = new FormData();
            
            // Get values by ID
            serverFormData.append('problemType', document.getElementById('problem-type').value);
            serverFormData.append('location', document.getElementById('location').value);
            serverFormData.append('description', document.getElementById('description').value);

            // Attach the file if one exists
            if (fileUpload && fileUpload.files[0]) {
                serverFormData.append('photo', fileUpload.files[0]);
            }

            try {
                // C. Send Data to Server
                const response = await fetch('/api/submit-report', {
                    method: 'POST',
                    // Note: Content-Type header is NOT set manually. 
                    // The browser sets it to 'multipart/form-data' automatically for FormData.
                    body: serverFormData 
                });

                if (!response.ok) {
                    throw new Error('Server responded with an error.');
                }

                const result = await response.json();
                console.log('Success:', result);

                // D. Handle Success
                alert(`Report Submitted Successfully!\nYour Ticket ID is: ${result.reportId}`);
                
                // Clear form and file text
                reportForm.reset();
                if(fileNameDisplay) fileNameDisplay.textContent = '';
                
                // Optional: Scroll back to top or redirect
                // window.location.href = 'index.html'; 

            } catch (error) {
                console.error('Error submitting form:', error);
                alert('Connection Error: Could not submit report. Please check your internet or server status.');
            } finally {
                // E. Reset Button State
                submitButton.disabled = false;
                submitButton.textContent = originalBtnText;
            }
        });
    }

});
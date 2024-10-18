document.getElementById('aiForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const responseDiv = document.getElementById('response');
    if (responseDiv === null) {
        console.error("Response div not found");
        return;
    }
    responseDiv.innerHTML = "Loading...";

    const formData = new FormData(this);
    const data = {
        prompt: formData.get('prompt'),
        task_type: formData.get('task_type')
    };

    try {
        const response = await fetch('/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log("API Response:", result);

        if (typeof result.response !== 'string') {
            console.error("Invalid response format");
            responseDiv.innerHTML = "Invalid response format";
            return;
        }

        // Sanitize and render the response
        try {
            // Use marked to convert markdown to HTML directly
            const sanitizedResponse = marked(result.response); // Convert markdown to HTML

            // Replace asterisks with an empty string or any desired character
            const cleanedResponse = sanitizedResponse.replace(/\*/g, ''); // Removes all asterisks

            responseDiv.innerHTML = cleanedResponse; // Set the inner HTML to the cleaned response
        } catch (error) {
            console.error("Error parsing markdown:", error);
            responseDiv.innerHTML = result.response; // Fallback if parsing fails
        }

        // Show feedback form after response is displayed
        const feedbackForm = document.getElementById('feedbackForm');
        if (feedbackForm !== null) {
            feedbackForm.style.display = 'block';
        } else {
            console.error("Feedback form not found");
        }
    } catch (error) {
        console.error("Error fetching response:", error);
        responseDiv.innerHTML = "Error fetching response. Please try again.";
    }
});

document.getElementById('feedbackForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const feedback = formData.get('feedback');

    try {
        const response = await fetch('/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ feedback })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        alert('Feedback submitted successfully!');
        // Hide feedback form after submission
        const feedbackForm = document.getElementById('feedbackForm');
        if (feedbackForm !== null) {
            feedbackForm.style.display = 'none';
        } else {
            console.error("Feedback form not found");
        }
    } catch (error) {
        console.error("Error submitting feedback:", error);
        alert('Failed to submit feedback.');
    }
});


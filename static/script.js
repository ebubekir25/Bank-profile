document.addEventListener('DOMContentLoaded', () => {
    const inputTypeSelect = document.getElementById('inputType');
    const textInputSection = document.getElementById('textInputSection');
    const pdfInputSection = document.getElementById('pdfInputSection');
    const materialForm = document.getElementById('materialForm');
    const responseOutput = document.getElementById('resultsOutput'); // Changed from 'responseOutput' to 'resultsOutput'
    const loadingIndicator = document.getElementById('loadingIndicator');

    inputTypeSelect.addEventListener('change', () => {
        if (inputTypeSelect.value === 'text') {
            textInputSection.style.display = 'block';
            pdfInputSection.style.display = 'none';
        } else {
            textInputSection.style.display = 'none';
            pdfInputSection.style.display = 'block';
        }
    });

    materialForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        loadingIndicator.style.display = 'block';
        responseOutput.innerHTML = ''; // Clear previous results

        const inputType = inputTypeSelect.value;
        let payload;
        let headers = {};
        let apiEndpoint = '/api/process';

        if (inputType === 'text') {
            const text = document.getElementById('textInput').value;
            if (!text.trim()) {
                responseOutput.innerHTML = '<p class="error">Please enter some text.</p>';
                loadingIndicator.style.display = 'none';
                return;
            }
            payload = JSON.stringify({ text: text });
            headers['Content-Type'] = 'application/json';
        } else { // PDF
            const pdfFile = document.getElementById('pdfFile').files[0];
            if (!pdfFile) {
                responseOutput.innerHTML = '<p class="error">Please select a PDF file.</p>';
                loadingIndicator.style.display = 'none';
                return;
            }
            payload = new FormData();
            payload.append('file', pdfFile); // Ensure key is 'file' as per backend app.py
            // Content-Type is set automatically by browser for FormData
        }

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: headers,
                body: payload,
            });

            loadingIndicator.style.display = 'none';
            const data = await response.json();

            if (response.ok && data.status === 'success') {
                let resultsHtml = '<h3>Input Preview:</h3>';
                resultsHtml += `<p class="preview-text">${data.input_text_preview || 'No preview available.'}</p>`;
                
                if (data.materials) {
                    for (const materialType in data.materials) {
                        const materialContent = data.materials[materialType];
                        // Sanitize materialType to be used as a class name or ID if needed
                        const typeClass = materialType.replace(/_/g, '-');
                        resultsHtml += `<div class="material-section">`;
                        resultsHtml += `<h4>${materialType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>`;
                        // Basic sanitization: replace newlines with <br> for HTML display
                        // A more robust HTML sanitization might be needed for production
                        const formattedContent = materialContent.replace(/\n/g, '<br>');
                        resultsHtml += `<p class="material-content material-${typeClass}">${formattedContent || 'No content generated.'}</p>`;
                        resultsHtml += `</div>`;
                    }
                } else {
                    resultsHtml += '<p>No materials were generated.</p>';
                }
                responseOutput.innerHTML = resultsHtml;
            } else {
                responseOutput.innerHTML = `<p class="error">Error: ${data.message || 'An unknown error occurred.'}</p>`;
            }
        } catch (error) {
            loadingIndicator.style.display = 'none';
            responseOutput.innerHTML = `<p class="error">Network Error: ${error.message}</p>`;
        }
    });
});

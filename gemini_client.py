import google.generativeai as genai

def generate_text_with_gemini(api_key: str, prompt: str):
    """
    Interacts with the Gemini API to generate text based on a prompt.

    Args:
        api_key: The API key for accessing the Gemini API.
        prompt: The prompt to send to the Gemini model.

    Returns:
        The generated text from the Gemini API, or an error message string.
    """
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Gemini API Error: {str(e)}"

import 'dart:convert';
import 'package:http/http.dart' as http;

class AIService {
  // IMPORTANT: This API key must be secured and not committed to version control.
  // Consider using environment variables or a secure secrets management solution.
  final String _apiKey = "YOUR_API_KEY_HERE";

  AIService();

  Future<String> generateContent(String inputText, String promptType) async {
    final url = Uri.parse('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=$_apiKey');
    
    final requestBody = {
      "contents": [{
        "parts":[{
          "text": "Prompt: $promptType\n\nContent: $inputText"
        }]
      }]
    };

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(requestBody),
      );

      if (response.statusCode == 200) {
        final responseBody = jsonDecode(response.body);
        // Assuming a basic response structure. This might need adjustment
        // based on the actual Gemini API response format.
        return responseBody['candidates'][0]['content']['parts'][0]['text'];
      } else {
        throw Exception('Failed to generate content: ${response.statusCode} ${response.body}');
      }
    } catch (e) {
      // Handle network errors or other exceptions during the HTTP request.
      throw Exception('Error connecting to AI service: $e');
    }
  }
}

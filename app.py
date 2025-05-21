import os
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from utils import extract_text_from_pdf
from gemini_client import generate_text_with_gemini

app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
GEMINI_API_KEY = "AIzaSyDfzk2cJWQCDuM7tH6re9X0kGN4fRYwzGM"  # Replace with your actual API key
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Ensure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/process", methods=["POST"])
def process_text():
    if "file" in request.files:
        file = request.files["file"]
        if file.filename == "":
            return jsonify({"status": "error", "message": "No selected file"}), 400
        if file and file.filename.endswith(".pdf"):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
            file.save(filepath)
            
            extracted_text = extract_text_from_pdf(filepath)
            if not extracted_text:
                return jsonify({"status": "error", "message": "Could not extract text from PDF"}), 500
            
            # Limit text length for API calls
            processed_text = extracted_text[:4000] # Increased limit slightly for more context

        elif request.is_json and "text" in request.get_json():
            data = request.get_json()
            text_input = data.get("text")
            if not text_input.strip():
                 return jsonify({"status": "error", "message": "Text input cannot be empty"}), 400
            processed_text = text_input[:4000] # Limit text length
        else:
            return jsonify({"status": "error", "message": "No text or PDF file provided, or invalid request format"}), 400

        material_prompts = {
            "summary": "Provide a concise summary of the key points in the following text: {text}",
            "quiz_mcq": "Generate a 5-question multiple-choice quiz based on the following text. Each question must have exactly 4 distinct answer options labeled A, B, C, and D. Clearly mark the correct answer by adding '(Correct Answer)' immediately after the correct option's text. Ensure all options are plausible and directly related to the text. Avoid using 'all of the above' or 'none of the above' as options. Questions should cover different aspects of the text. Text: {text}",
            "flashcards": "Extract exactly 5 key terms from the following text. For each term, provide a very brief and concise definition (ideally under 15 words), suitable for flashcards. Format each entry strictly as 'Term: Definition'. Focus on the most important and relevant terms in the text. Text: {text}",
            "lesson_plan_outline": "Create a structured lesson plan outline based on the following text. The outline must include these sections: \n1. Learning Objectives (list at least 3 specific objectives). \n2. Key Activities (describe at least 3 engaging activities for students). \n3. Assessment Methods (suggest at least 2 distinct methods to check understanding). \nEnsure the content of each section is directly derived from the provided text. Text: {text}",
            "discussion_prompts": "Generate 3 distinct, thought-provoking discussion prompts related to the core concepts and implications of the following text. These prompts should encourage critical thinking and be suitable for a high school or early college level classroom discussion. Text: {text}",
            "case_study_idea": "Based on the following text, suggest one idea for a short case study (approx. 150-200 words) that could be used to illustrate its main concepts in a practical or applied way. Provide a brief scenario including a problem or situation and potential questions for analysis. Text: {text}",
            "simulation_idea": "Propose one concept for a simple simulation or role-playing activity (explainable in about 150-200 words) that is directly related to the core ideas in the following text. Describe the basic setup, roles (if any), and the objective of the activity. Text: {text}",
            "interactive_exercise_idea": "Suggest one specific idea for an interactive exercise (e.g., a matching game, a drag-and-drop classification, a fill-in-the-blanks paragraph using key terms) that could be created based on the content of the following text. Briefly describe how the exercise would work and what it would help reinforce. Text: {text}",
            "learning_objectives": "Based on the following text, list 3-4 clear learning objectives for someone studying this material. Start each objective with the phrase 'The learner will be able to...'. Ensure objectives are measurable and directly reflect the key information or skills presented in the text. Text: {text}",
            "key_vocabulary_list": "Identify 5 to 7 of the most important and contextually relevant vocabulary terms from the following text. For each term, provide a concise definition (around 10-20 words) based on its usage within the text. Format as 'Term: Definition'. Text: {text}"
        }

        generated_materials = {}
        
        for material_type, prompt_template in material_prompts.items():
            prompt = prompt_template.format(text=processed_text)
            try:
                # Ensure GEMINI_API_KEY is correctly passed and used
                gemini_response = generate_text_with_gemini(api_key=GEMINI_API_KEY, prompt=prompt)
                generated_materials[material_type] = gemini_response
            except Exception as e:
                # Log the exception e for server-side debugging if needed
                print(f"Error generating {material_type}: {str(e)}")
                generated_materials[material_type] = f"Error generating {material_type}."
        
        return jsonify({
            "status": "success",
            "input_text_preview": processed_text[:500],
            "materials": generated_materials
        })

if __name__ == "__main__":
    app.run(debug=True)

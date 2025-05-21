import 'package:flutter/material.dart';
import 'package:profileui/educational_tool/ai_service.dart';
import 'package:profileui/educational_tool/models/quiz_question.dart';
import 'package:profileui/educational_tool/models/flashcard.dart';

class EducationalToolScreen extends StatefulWidget {
  const EducationalToolScreen({super.key});

  @override
  State<EducationalToolScreen> createState() => _EducationalToolScreenState();
}

class _EducationalToolScreenState extends State<EducationalToolScreen> {
  final TextEditingController _textController = TextEditingController();
  String? _selectedMaterialType = "Summary";
  final List<String> _materialTypes = ["Summary", "Quiz", "Flashcards", "Explanation"];
  bool _isLoading = false;
  String _generatedContent = "";
  final AIService _aiService = AIService();
  List<QuizQuestion> _quizQuestions = [];
  List<Flashcard> _flashcards = [];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Educational Material Generator"),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            TextField(
              controller: _textController,
              maxLines: 5,
              decoration: const InputDecoration(
                hintText: "Enter your text here...",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16.0),
            DropdownButtonFormField<String>(
              value: _selectedMaterialType,
              decoration: const InputDecoration(
                labelText: "Select Material Type",
                border: OutlineInputBorder(),
              ),
              items: _materialTypes.map((String type) {
                return DropdownMenuItem<String>(
                  value: type,
                  child: Text(type),
                );
              }).toList(),
              onChanged: (String? newValue) {
                setState(() {
                  _selectedMaterialType = newValue;
                });
              },
            ),
            const SizedBox(height: 16.0),
            ElevatedButton(
              onPressed: () async {
                setState(() {
                  _isLoading = true;
                  _generatedContent = "";
                  _quizQuestions = [];
                  _flashcards = [];
                });

                final inputText = _textController.text;
                final promptType = _selectedMaterialType;

                if (inputText.isEmpty) {
                  setState(() {
                    _generatedContent = "Please enter some text.";
                    _isLoading = false;
                  });
                  return;
                }

                try {
                  final result = await _aiService.generateContent(inputText, promptType!);
                  if (promptType == "Quiz") {
                    _quizQuestions = _parseQuizQuestions(result);
                  } else if (promptType == "Flashcards") {
                    _flashcards = _parseFlashcards(result);
                  } else {
                    _generatedContent = result;
                  }
                  setState(() {
                    _isLoading = false;
                  });
                } catch (e) {
                  setState(() {
                    _generatedContent = "Error: ${e.toString()}";
                    _isLoading = false;
                  });
                }
              },
              child: const Text("Generate"),
            ),
            const SizedBox(height: 16.0),
            if (_isLoading)
              const Center(child: CircularProgressIndicator())
            else if (_selectedMaterialType == "Quiz" && _quizQuestions.isNotEmpty)
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Quiz Questions:", style: Theme.of(context).textTheme.titleMedium),
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _quizQuestions.length,
                    itemBuilder: (context, index) {
                      final item = _quizQuestions[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(vertical: 8.0),
                        child: Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text("Q: ${item.question}", style: Theme.of(context).textTheme.titleMedium),
                              ...item.options.map((option) => Text(option)),
                              Text("Correct: ${item.correctAnswer}", style: const TextStyle(fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ],
              )
            else if (_selectedMaterialType == "Flashcards" && _flashcards.isNotEmpty)
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Flashcards:", style: Theme.of(context).textTheme.titleMedium),
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _flashcards.length,
                    itemBuilder: (context, index) {
                      final item = _flashcards[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(vertical: 8.0),
                        child: Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text("Front: ${item.frontText}", style: Theme.of(context).textTheme.titleMedium),
                              Text("Back: ${item.backText}"),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ],
              )
            else if (_generatedContent.isNotEmpty)
              Expanded(
                child: SingleChildScrollView(
                  child: Text(
                    _generatedContent,
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

  List<QuizQuestion> _parseQuizQuestions(String rawResponse) {
    final List<QuizQuestion> questions = [];
    try {
      final questionBlocks = rawResponse.split('---').where((block) => block.trim().isNotEmpty);
      for (var block in questionBlocks) {
        final lines = block.trim().split('\n').where((line) => line.trim().isNotEmpty).toList();
        if (lines.isEmpty) continue;

        String question = "";
        List<String> options = [];
        String correctAnswer = "";

        for (var line in lines) {
          if (line.startsWith("Q:")) {
            question = line.substring(2).trim();
          } else if (line.startsWith("A:") || line.startsWith("B:") || line.startsWith("C:") || line.startsWith("D:")) {
            options.add(line.trim());
          } else if (line.startsWith("Correct:")) {
            correctAnswer = line.substring(8).trim();
          }
        }
        
        if (question.isNotEmpty && options.isNotEmpty && correctAnswer.isNotEmpty) {
          questions.add(QuizQuestion(question: question, options: options, correctAnswer: correctAnswer));
        }
      }
    } catch (e) {
      // Log error or handle appropriately
      print("Error parsing quiz questions: $e");
    }
    return questions;
  }

  List<Flashcard> _parseFlashcards(String rawResponse) {
    final List<Flashcard> flashcards = [];
    try {
      final flashcardBlocks = rawResponse.split('---').where((block) => block.trim().isNotEmpty);
      for (var block in flashcardBlocks) {
        final lines = block.trim().split('\n').where((line) => line.trim().isNotEmpty).toList();
        if (lines.length < 2) continue;

        String frontText = "";
        String backText = "";

        for (var line in lines) {
          if (line.startsWith("Front:")) {
            frontText = line.substring(6).trim();
          } else if (line.startsWith("Back:")) {
            backText = line.substring(5).trim();
          }
        }

        if (frontText.isNotEmpty && backText.isNotEmpty) {
          flashcards.add(Flashcard(frontText: frontText, backText: backText));
        }
      }
    } catch (e) {
      // Log error or handle appropriately
      print("Error parsing flashcards: $e");
    }
    return flashcards;
  }
}

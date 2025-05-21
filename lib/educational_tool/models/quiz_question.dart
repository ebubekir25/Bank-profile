class QuizQuestion {
  final String question;
  final List<String> options; // For multiple choice
  final String correctAnswer; // Could be an index or the text of the correct option

  QuizQuestion({
    required this.question,
    required this.options,
    required this.correctAnswer,
  });

  // Optional: Factory constructor for JSON parsing if the AI gives structured quiz data.
  // This depends on the AI's output format. For now, manual parsing might be used.
  // factory QuizQuestion.fromJson(Map<String, dynamic> json) {
  //   return QuizQuestion(
  //     question: json['question'],
  //     options: List<String>.from(json['options']),
  //     correctAnswer: json['correctAnswer'],
  //   );
  // }
}

class Flashcard {
  final String frontText;
  final String backText;

  Flashcard({
    required this.frontText,
    required this.backText,
  });

  // Optional: Factory constructor for JSON parsing if the AI gives structured flashcard data.
  // This depends on the AI's output format. For now, manual parsing might be used.
  // factory Flashcard.fromJson(Map<String, dynamic> json) {
  //   return Flashcard(
  //     frontText: json['frontText'],
  //     backText: json['backText'],
  //   );
  // }
}

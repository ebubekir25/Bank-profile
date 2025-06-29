<?php
/**
 * EduNomo Contact API Endpoint
 * Güvenli iletişim formu işleme
 */

// Güvenlik ve yapılandırma dosyalarını yükle
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../classes/Logger.php';
require_once __DIR__ . '/../classes/MailService.php';

// Oturum başlat
session_start();

// Güvenlik başlıklarını ayarla
Security::setSecurityHeaders();

// JSON yanıt için header ayarla
header('Content-Type: application/json; charset=utf-8');

// Sadece POST isteklerini kabul et
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "success" => false, 
        "message" => "Sadece POST istekleri kabul edilir"
    ]);
    exit;
}

try {
    // JSON verilerini al
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Form verilerini al (hem JSON hem de form-data desteği)
    $name = $input['name'] ?? $_POST['name'] ?? '';
    $email = $input['email'] ?? $_POST['email'] ?? '';
    $message = $input['message'] ?? $_POST['message'] ?? '';
    $csrf_token = $input['csrf_token'] ?? $_POST['csrf_token'] ?? '';
    
    // CSRF token kontrolü
    if (!Security::validateCSRFToken($csrf_token)) {
        throw new Exception("Güvenlik doğrulaması başarısız");
    }
    
    // Veri doğrulama
    if (empty($name) || empty($email) || empty($message)) {
        throw new Exception("Lütfen tüm alanları doldurun");
    }
    
    if (strlen($name) < 2 || strlen($name) > 100) {
        throw new Exception("İsim 2-100 karakter arasında olmalıdır");
    }
    
    if (strlen($message) < 10 || strlen($message) > 1000) {
        throw new Exception("Mesaj 10-1000 karakter arasında olmalıdır");
    }
    
    if (!Security::validateEmail($email)) {
        throw new Exception("Geçersiz email adresi");
    }
    
    // Rate limiting kontrolü
    $clientIP = Security::getClientIP();
    if (!Security::checkRateLimit($clientIP . '_contact', 3, 3600)) {
        throw new Exception("Çok fazla istek gönderdiniz. Lütfen 1 saat sonra tekrar deneyin.");
    }
    
    // Mail servisini başlat ve gönder
    $mailService = new MailService();
    $result = $mailService->sendContactForm($name, $email, $message);
    
    // Başarılı ise otomatik yanıt gönder
    if ($result['success']) {
        $mailService->sendAutoReply($email, $name);
        
        // Başarılı işlemi logla
        Logger::info("İletişim formu başarıyla gönderildi", [
            'name' => $name,
            'email' => $email,
            'ip' => $clientIP
        ]);
    }
    
    // Yanıtı döndür
    echo json_encode($result);
    
} catch (Exception $e) {
    // Hata durumunu logla
    Logger::error("İletişim formu hatası", [
        'error' => $e->getMessage(),
        'ip' => Security::getClientIP(),
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'
    ]);
    
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
<?php
// Sadece POST isteği olduğunda çalış
if ($_SERVER["REQUEST_METHOD"] != "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    exit;
}

// PHPMailer sınıflarını yükle
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

// POST verilerini al ve temizle
$name = filter_var($_POST['name'] ?? '', FILTER_SANITIZE_STRING);
$email = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);
$message = filter_var($_POST['message'] ?? '', FILTER_SANITIZE_STRING);

// Basit doğrulama
if (empty($name) || empty($email) || empty($message) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Lütfen tüm alanları doğru şekilde doldurun."]);
    exit;
}

// Mail gönderme işlemi
try {
    $mail = new PHPMailer(true);
    
    // SMTP ayarları
    $mail->isSMTP();
    $mail->Host = 'ni-tidy.guzelhosting.com'; // Gmail için
    $mail->SMTPAuth = true;
    $mail->Username = 'info@edunomo.com';
    $mail->Password = 'Nn.5364299816';
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;
    
    // Charset ve alıcı/gönderici ayarları
    $mail->CharSet = 'UTF-8';
    $mail->setFrom('info@edunomo.com', 'EduNomo İletişim Formu');
    $mail->addAddress('info@edunomo.com', 'EduNomo');
    $mail->addAddress('ebubekirkaba25@gmail.com', 'Ebubekir KABA');
    $mail->addReplyTo($email, $name);
    
    // Mail içeriği
    $mail->isHTML(true);
    $mail->Subject = 'EduNomo İletişim Formu: ' . $name;
    $mail->Body = "
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                h1 { color: #00867d; border-bottom: 2px solid #00867d; padding-bottom: 10px; }
                .info { margin-bottom: 20px; }
                .label { font-weight: bold; }
            </style>
        </head>
        <body>
            <div class='container'>
                <h1>EduNomo İletişim Formu</h1>
                <div class='info'>
                    <p><span class='label'>Gönderen:</span> {$name}</p>
                    <p><span class='label'>E-posta:</span> {$email}</p>
                </div>
                <div class='message'>
                    <p><span class='label'>Mesaj:</span></p>
                    <p>" . nl2br($message) . "</p>
                </div>
            </div>
        </body>
        </html>
    ";
    
    $mail->AltBody = "Gönderen: {$name}\nE-posta: {$email}\n\nMesaj:\n{$message}";
    
    $mail->send();
    echo json_encode(["success" => true, "message" => "Mesajınız başarıyla gönderildi. En kısa sürede sizinle iletişime geçeceğiz."]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Mesaj gönderilemedi: {$mail->ErrorInfo}"]);
}
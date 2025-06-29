<?php
/**
 * EduNomo Main Index File
 * Ana sayfa ve güvenlik kontrolleri
 */

// Güvenlik ve yapılandırma
require_once __DIR__ . '/config/security.php';
require_once __DIR__ . '/classes/Logger.php';

// Oturum başlat
session_start();

// Güvenlik başlıklarını ayarla
Security::setSecurityHeaders();

// Sayfa ziyaretini logla
Logger::info("Ana sayfa ziyareti", [
    'ip' => Security::getClientIP(),
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'
]);

// CSRF token oluştur
$csrf_token = Security::generateCSRFToken();
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="EduNomo - Yapay zeka destekli eğitim materyali oluşturma platformu. Saniyeler içinde profesyonel ders planları, quiz'ler ve eğitim içerikleri oluşturun.">
    <meta name="keywords" content="eğitim, yapay zeka, ders planı, quiz, materyal oluşturma, öğretmen, eğitim teknolojisi">
    <meta name="author" content="EduNomo">
    <meta name="robots" content="index, follow">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="EduNomo | AI Eğitim Materyali Oluşturucu">
    <meta property="og:description" content="Yapay zeka ile saniyeler içinde profesyonel eğitim materyalleri oluşturun">
    <meta property="og:image" content="<?php echo $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['HTTP_HOST']; ?>/cover.png">
    <meta property="og:url" content="<?php echo $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['HTTP_HOST']; ?>">
    <meta property="og:type" content="website">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="EduNomo | AI Eğitim Materyali Oluşturucu">
    <meta name="twitter:description" content="Yapay zeka ile saniyeler içinde profesyonel eğitim materyalleri oluşturun">
    <meta name="twitter:image" content="<?php echo $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['HTTP_HOST']; ?>/cover.png">
    
    <title>EduNomo | AI Eğitim Materyali Oluşturucu</title>
    
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="man.png">
    <link rel="apple-touch-icon" href="man.png">
    
    <!-- Preload Critical Resources -->
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Nunito:wght@400;500;600;700&display=swap" as="style">
    <link rel="preload" href="styles.css" as="style">
    <link rel="preload" href="func.js" as="script">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer">
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- AOS Animation Library -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css" integrity="sha512-1cK78a1o+ht2JcaW6g8OXYwqpev9+6GqOkz9xmBN9iUUhIndKtxwILGWYOSibOKjLsEdjyjZvYDq/cZwNeak0w==" crossorigin="anonymous" referrerpolicy="no-referrer">
    
    <!-- SweetAlert2 -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11.7.32/dist/sweetalert2.min.css" integrity="sha512-1gkKDiXMNdwrGGmj8KzOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhOJJhO" crossorigin="anonymous" referrerpolicy="no-referrer">
    
    <!-- Main Styles -->
    <link rel="stylesheet" href="styles.css">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "EduNomo",
        "description": "Yapay zeka destekli eğitim materyali oluşturma platformu",
        "url": "<?php echo $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['HTTP_HOST']; ?>",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "Web Browser",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "TRY"
        }
    }
    </script>
    
    <!-- CSRF Token for JavaScript -->
    <script>
        window.CSRF_TOKEN = '<?php echo $csrf_token; ?>';
        window.APP_CONFIG = {
            apiUrl: '<?php echo $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['HTTP_HOST']; ?>/api',
            environment: '<?php echo $_ENV['ENVIRONMENT'] ?? 'production'; ?>'
        };
    </script>
</head>
<body>
    <!-- Preloader -->
    <div id="preloader">
        <div class="spinner-container">
            <div class="spinner"></div>
            <p>EduNomo Yükleniyor...</p>
        </div>
    </div>

    <!-- Theme Switcher Floating Button -->
    <button id="theme-toggle" class="theme-toggle" aria-label="Tema Değiştir">
        <i class="fas fa-moon"></i>
        <i class="fas fa-sun"></i>
    </button>

    <!-- Header & Navigation -->
    <header class="main-header">
        <div class="container">
            <nav class="main-nav">
                <div class="logo">
                    <a href="#" class="logo-link">
                        <i class="fas fa-brain"></i>
                        <span>EduNomo</span>
                    </a>
                </div>

                <div class="mobile-menu-toggle">
                    <button id="menu-toggle" aria-label="Menü">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>

                <ul class="nav-list">
                    <li class="nav-item"><a href="#top" class="nav-link active"><i class="fas fa-home"></i> Ana Sayfa</a></li>
                    <li class="nav-item"><a href="#features" class="nav-link"><i class="fas fa-rocket"></i> Özellikler</a></li>
                    <li class="nav-item"><a href="#generator" class="nav-link"><i class="fas fa-magic"></i> Oluşturucu</a></li>
                    <li class="nav-item"><a href="#about" class="nav-link"><i class="fas fa-info-circle"></i> Hakkında</a></li>
                    <li class="nav-item"><a href="#contact" class="nav-link"><i class="fas fa-envelope"></i> İletişim</a></li>
                    <li class="nav-item mobile-only"><a href="#" id="mobile-theme-toggle" class="nav-link"><i class="fas fa-moon"></i> Temayı Değiştir</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <main id="top">
        <!-- Hero Section -->
        <section class="hero">
            <div class="container">
                <div class="hero-content" data-aos="fade-right" data-aos-duration="1000">
                    <h1 class="hero-title">Yapay Zeka ile <span>Eğitim Materyalleri</span> Oluşturun</h1>
                    <p class="hero-subtitle">Tek tıkla profesyonel eğitim içerikleri, sınavlar, izlenceler ve detaylı ders planlarını saniyeler içinde hazırlayın!</p>
                    <div class="hero-buttons">
                        <a href="#generator" class="btn btn-primary btn-lg">
                            <i class="fas fa-magic"></i> Hemen Başla
                        </a>
                        <a href="#features" class="btn btn-outline btn-lg">
                            <i class="fas fa-list-check"></i> Özellikler
                        </a>
                    </div>
                </div>
                <div class="hero-image" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="300">
                    <img src="cover.png" alt="EduNomo AI Görseli" loading="lazy">
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section id="features" class="features">
            <div class="container">
                <div class="section-header" data-aos="fade-up">
                    <span class="section-subtitle">Neler Yapabilirsiniz?</span>
                    <h2 class="section-title">Özellikler ve Faydalar</h2>
                    <p class="section-description">EduNomo AI ile eğitim materyali hazırlamak hiç bu kadar kolay olmamıştı.</p>
                </div>

                <div class="features-grid">
                    <!-- Feature Cards -->
                    <div class="feature-card" data-aos="fade-up" data-aos-delay="100">
                        <div class="feature-icon"><i class="fas fa-bolt"></i></div>
                        <h3>Hızlı Üretim</h3><p>Saniyeler içinde kapsamlı eğitim materyalleri.</p>
                    </div>
                    <div class="feature-card" data-aos="fade-up" data-aos-delay="200">
                        <div class="feature-icon"><i class="fas fa-layer-group"></i></div>
                        <h3>20+ Materyal Türü</h3><p>Quiz'den PowerPoint'e, flash karttan senaryoya.</p>
                    </div>
                    <div class="feature-card" data-aos="fade-up" data-aos-delay="300">
                        <div class="feature-icon"><i class="fas fa-vr-cardboard"></i></div>
                        <h3>Etkileşimli Kartlar</h3><p>Animasyonlu ve çevrilebilir flash kartlar.</p>
                    </div>
                    <div class="feature-card" data-aos="fade-up" data-aos-delay="400">
                        <div class="feature-icon"><i class="fas fa-file-pdf"></i></div>
                        <h3>PDF Çıktı</h3><p>Üretilen materyalleri profesyonel PDF olarak indirin.</p>
                    </div>
                    <div class="feature-card" data-aos="fade-up" data-aos-delay="500">
                        <div class="feature-icon"><i class="fas fa-calendar-alt"></i></div>
                        <h3>Ders İzlencesi</h3><p>Haftalık planlı eğitim içerikleri ve materyalleri.</p>
                    </div>
                    <div class="feature-card" data-aos="fade-up" data-aos-delay="600">
                        <div class="feature-icon"><i class="fas fa-chalkboard-teacher"></i></div>
                        <h3>Detaylı Ders Planı</h3><p>Dakika dakika planlanmış profesyonel ders senaryoları.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Generator Section -->
        <section id="generator" class="generator">
            <div class="container">
                <!-- Assistant Introduction -->
                <div class="assistant-container" data-aos="fade-up">
                     <div class="assistant-card">
                        <div class="assistant-avatar">
                            <img src="man.png" alt="EduNomo Asistan" id="assistant-image" loading="lazy">
                            <div class="assistant-status"></div>
                        </div>
                        <div class="assistant-content">
                            <div class="assistant-header">
                                <h2>Merhaba! Ben Nomo <i class="fas fa-robot"></i></h2>
                                <span class="assistant-badge">Yapay Zeka Asistanı</span>
                            </div>
                            <p class="assistant-message">Size harika eğitim materyalleri, ders izlenceleri ve detaylı ders planları oluşturmak için buradayım! Aşağıdaki formu kullanarak istediğiniz konuda materyaller hazırlayabilirim.</p>
                            <div class="assistant-tips">
                                <div class="tip-item">
                                    <i class="fas fa-lightbulb"></i>
                                    <p>Konunuzu ne kadar detaylı yazarsanız, sonuçlar o kadar isabetli olur.</p>
                                </div>
                                <div class="tip-item">
                                    <i class="fas fa-calendar-week"></i>
                                    <p>İzlence oluşturarak konuyu haftalara bölüp kapsamlı öğretim planı alabilirsiniz.</p>
                                </div>
                                <div class="tip-item">
                                    <i class="fas fa-chalkboard-teacher"></i>
                                    <p>Ders planı ile her dersinizin dakika dakika senaryosunu hazırlayabilirim.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Material Generator Form -->
                <div class="form-container" data-aos="fade-up" data-aos-delay="200">
                    <form id="material-form" class="material-form">
                        <input type="hidden" name="csrf_token" value="<?php echo $csrf_token; ?>">
                        <div class="form-header">
                            <h2><i class="fas fa-pencil-ruler"></i> Eğitim Materyali Oluşturucu</h2><span>(Ücretsiz Beta)</span>
                            <p>Konuyu girin ve materyal türünü seçin, gerisini bize bırakın!</p>
                        </div>

                        <div class="form-body">
                            <div class="form-group">
                                <label for="topic">
                                    <i class="fas fa-book-open"></i> Konu veya Metin:
                                    <span class="required-mark">*</span>
                                </label>
                                <div class="input-wrapper">
                                    <textarea
                                        id="topic"
                                        name="topic"
                                        rows="5"
                                        placeholder="Örn: Hücrenin yapısı ve organelleri, Küresel Isınmanın Etkileri, Python Programlama Temelleri..."
                                        required
                                        maxlength="500"
                                        autocomplete="off"
                                    ></textarea>
                                    <div class="input-icon">
                                        <i class="fas fa-edit"></i>
                                    </div>
                                    <div class="character-counter">
                                        <span id="char-count">0</span> / 500
                                    </div>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="syllabus-option">
                                    <i class="fas fa-calendar"></i> İzlence Oluşturma:
                                </label>
                                <div class="syllabus-switch-container">
                                    <div class="syllabus-switch">
                                        <input type="checkbox" id="syllabus-option" name="syllabus-option">
                                        <label for="syllabus-option">İzlence oluşturmak istiyorum</label>
                                    </div>
                                    <div class="syllabus-info">
                                        <i class="fas fa-info-circle"></i>
                                        <span>İzlence, konuyu haftalara bölen detaylı bir öğretim planıdır.</span>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group" id="material-type-container">
                                <label for="material-type">
                                    <i class="fas fa-shapes"></i> Materyal Türü:
                                    <span class="required-mark">*</span>
                                </label>
                                <div class="input-wrapper select-wrapper">
                                    <select id="material-type" name="material-type" required>
                                        <option value="">Materyal Türü Seçin...</option>
                                        <option value="all">✨ Tüm Materyal Türleri (Tam Set)</option>
                                        <optgroup label="Temel Materyaller">
                                            <option value="summary">📄 Ünite Özeti</option>
                                            <option value="flashcards">🗂️ Flash Kartlar (Etkileşimli)</option>
                                            <option value="key-concepts">🔑 Anahtar Kavramlar</option>
                                            <option value="powerpoint">📊 PowerPoint İçeriği</option>
                                        </optgroup>
                                        <optgroup label="Değerlendirme Araçları">
                                            <option value="quiz">❓ Çoktan Seçmeli Sorular</option>
                                            <option value="short-answer">✍️ Kısa Cevaplı Sorular</option>
                                            <option value="fill-blanks">✏️ Boşluk Doldurma</option>
                                            <option value="true-false">✅ Doğru/Yanlış İfadeleri</option>
                                        </optgroup>
                                        <optgroup label="Üst Düzey Düşünme">
                                            <option value="cause-effect">🔗 Neden-Sonuç İlişkileri</option>
                                            <option value="compare">🔄 Karşılaştırma Soruları</option>
                                            <option value="pros-cons">👍👎 Avantajlar ve Dezavantajlar</option>
                                            <option value="concept-map">🗺️ Kavram Haritası Öğeleri</option>
                                        </optgroup>
                                        <optgroup label="Yaratıcı Materyaller">
                                            <option value="real-world">🌍 Gerçek Hayat Örnekleri</option>
                                            <option value="metaphor">💡 Metafor / Benzetme</option>
                                            <option value="case-study">💼 Mini Vaka Analizi</option>
                                            <option value="prediction">🔮 Tahmin Soruları</option>
                                            <option value="discussion">🗣️ Tartışma Soruları</option>
                                            <option value="acronym">🅰️ Akronim Oluşturma</option>
                                        </optgroup>
                                    </select>
                                    <div class="select-arrow">
                                        <i class="fas fa-chevron-down"></i>
                                    </div>
                                </div>
                            </div>

                            <div class="form-footer">
                                <div class="form-actions">
                                    <button type="submit" id="btn-generate" class="btn btn-primary btn-generate">
                                        <i class="fas fa-wand-magic-sparkles"></i>
                                        <span>Materyali Oluştur</span>
                                    </button>
                                    <button type="reset" class="btn btn-outline btn-reset">
                                        <i class="fas fa-undo"></i>
                                        <span>Temizle</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <!-- Output Area -->
                <div id="output-area" class="output-area" style="display: none;" data-aos="fade-up">
                    <!-- Results Header -->
                    <div id="output-header" class="output-header">
                        <div class="output-title">
                            <h2 id="output-title-text"><i class="fas fa-lightbulb"></i> Oluşturulan Materyal</h2>
                            <p id="output-subtitle" class="output-subtitle"></p>
                        </div>
                        <div id="pdf-download-area" class="pdf-actions" style="display: none;">
                            <button id="btn-download-pdf" class="btn btn-danger">
                                <i class="fas fa-file-pdf"></i> PDF İndir
                            </button>
                            <button id="btn-copy-all" class="btn btn-secondary">
                                <i class="fas fa-copy"></i> Tümünü Kopyala
                            </button>
                        </div>
                    </div>

                    <!-- Loading Animation -->
                    <div id="loading" class="loading-container" style="display: none;">
                        <div class="loading-content">
                            <div class="assistant-thinking">
                                <img src="man.png" alt="Asistan Çalışıyor" id="loading-character" loading="lazy">
                                <div class="thinking-bubble">
                                    <div class="thinking-dots">
                                        <span></span><span></span><span></span>
                                    </div>
                                    <p id="loading-message">Yapay zeka harıl harıl çalışıyor… 🧠 Çayınızı yudumlarken ben saniyeler içinde ders izlencesi ve materyalleri çıkarıyorum — siz yeter ki "ders var" deyin, gerisini ben hallederim! 😎📚💻</p>
                                </div>
                            </div>
                            <div class="progress-bar-container">
                                <div class="progress-fill"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Syllabus Results Container -->
                    <div id="syllabus-result" class="syllabus-result-container" style="display: none;">
                        <!-- İzlence sonuçları buraya JS ile eklenecek -->
                    </div>

                    <!-- Lesson Plans Results Container -->
                    <div id="lesson-plan-result" class="lesson-plan-result-container" style="display: none;">
                        <!-- Ders planı sonuçları buraya JS ile eklenecek -->
                    </div>

                    <!-- Regular Results Container -->
                    <div id="result" class="result-container">
                        <!-- Materyal kartları buraya JS ile eklenecek -->
                    </div>

                    <!-- Share and Feedback -->
                    <div id="feedback-area" class="feedback-area" style="display: none;">
                        <div class="feedback-question">
                            <p>Bu materyal yararlı oldu mu?</p>
                            <div class="feedback-buttons">
                                <button id="btn-helpful" class="btn-feedback" aria-label="Yararlı"><i class="fas fa-thumbs-up"></i></button>
                                <button id="btn-not-helpful" class="btn-feedback" aria-label="Yararlı Değil"><i class="fas fa-thumbs-down"></i></button>
                            </div>
                        </div>
                        <div class="share-options">
                            <p>Paylaş:</p>
                            <div class="share-buttons">
                                <button class="btn-share" aria-label="Twitter'da Paylaş"><i class="fab fa-twitter"></i></button>
                                <button class="btn-share" aria-label="Facebook'ta Paylaş"><i class="fab fa-facebook"></i></button>
                                <button class="btn-share" aria-label="WhatsApp'ta Paylaş"><i class="fab fa-whatsapp"></i></button>
                                <button class="btn-share" aria-label="Bağlantıyı Kopyala"><i class="fas fa-link"></i></button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PDF Content Container (Hidden but structured for rendering) -->
                <div id="pdf-content-container" class="pdf-container-hidden">
                    <!-- PDF içeriği buraya JS ile eklenecek -->
                </div>
            </div>
        </section>

        <!-- About Section -->
        <section id="about" class="about">
            <div class="container">
                <div class="section-header" data-aos="fade-up">
                    <span class="section-subtitle">Nasıl Çalışır?</span>
                    <h2 class="section-title">Hakkında</h2>
                    <p class="section-description">EduNomo, eğitimcilere materyal hazırlama sürecinde vakit kazandıran yapay zeka tabanlı bir asistanıdır.</p>
                </div>

                <div class="process-steps">
                    <div class="process-step" data-aos="fade-right" data-aos-delay="100">
                        <div class="step-number">1</div>
                        <div class="step-content"><h3>Konu Girin</h3><p>İstediğiniz eğitim konusunu detaylı şekilde yazın.</p></div>
                    </div>
                    <div class="process-step" data-aos="fade-right" data-aos-delay="200">
                        <div class="step-number">2</div>
                        <div class="step-content"><h3>Materyal veya İzlence Seçin</h3><p>İhtiyacınıza uygun materyalleri veya haftalık izlence oluşturun.</p></div>
                    </div>
                    <div class="process-step" data-aos="fade-right" data-aos-delay="300">
                        <div class="step-number">3</div>
                        <div class="step-content"><h3>Ders Planı Ekleyin (İsteğe Bağlı)</h3><p>İzlence ile birlikte detaylı ders planları da oluşturabilirsiniz.</p></div>
                    </div>
                    <div class="process-step" data-aos="fade-right" data-aos-delay="400">
                        <div class="step-number">4</div>
                        <div class="step-content"><h3>Yapay Zeka Üretsin</h3><p>Gelişmiş AI saniyeler içinde içerikleri oluşturur.</p></div>
                    </div>
                    <div class="process-step" data-aos="fade-right" data-aos-delay="500">
                        <div class="step-number">5</div>
                        <div class="step-content"><h3>İndirin ve Kullanın</h3><p>İçeriği PDF olarak indirin veya kopyalayıp kullanın.</p></div>
                    </div>
                </div>

                <div class="about-cta" data-aos="zoom-in" data-aos-delay="500">
                    <h3>Eğitim materyali oluşturmaya hemen başlayın!</h3>
                    <a href="#generator" class="btn btn-primary"><i class="fas fa-rocket"></i> Şimdi Deneyin</a>
                </div>
            </div>
        </section>

        <!-- Contact Section -->
        <section id="contact" class="contact">
            <div class="container">
                <div class="section-header" data-aos="fade-up">
                    <span class="section-subtitle">Sorularınız mı var?</span>
                    <h2 class="section-title">İletişim</h2>
                    <p class="section-description">Öneri, geri bildirim veya işbirliği için bizimle iletişime geçin.</p>
                </div>

                <div class="contact-container">
                    <div class="contact-info" data-aos="fade-right" data-aos-delay="100">
                        <div class="contact-item">
                            <i class="fas fa-envelope"></i><div><h3>E-posta</h3><p><a href="mailto:info@edunomo.com">info@edunomo.com</a></p></div>
                        </div>
                        <div class="contact-item">
                            <i class="fas fa-map-marker-alt"></i><div><h3>Adres</h3><p>Teknoloji Vadisi No:42, İstanbul/Türkiye</p></div>
                        </div>
                        <div class="contact-item">
                            <i class="fas fa-phone"></i><div><h3>Telefon</h3><p><a href="tel:+902125554242">+90 212 555 4242</a></p></div>
                        </div>
                        <div class="social-links">
                            <a href="#" class="social-link" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                            <a href="#" class="social-link" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
                            <a href="#" class="social-link" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                            <a href="#" class="social-link" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
                        </div>
                    </div>

                    <div class="contact-form" data-aos="fade-left" data-aos-delay="200">
                        <form id="feedback-form">
                            <input type="hidden" name="csrf_token" value="<?php echo $csrf_token; ?>">
                            <div class="form-group">
                                <label for="name">İsim</label>
                                <input type="text" id="name" name="name" placeholder="Adınız" required autocomplete="name">
                            </div>
                            <div class="form-group">
                                <label for="email">E-posta</label>
                                <input type="email" id="email" name="email" placeholder="E-posta adresiniz" required autocomplete="email">
                            </div>
                            <div class="form-group">
                                <label for="message">Mesaj</label>
                                <textarea id="message" name="message" rows="4" placeholder="Mesajınız" required></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block">
                                <i class="fas fa-paper-plane"></i> Gönder
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer class="main-footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand">
                    <div class="footer-logo"><i class="fas fa-brain"></i><span>EduNomo</span></div>
                    <p>Eğitimciler için yapay zeka tabanlı içerik oluşturma platformu.</p>
                </div>

                <div class="footer-links">
                    <div class="footer-links-column">
                        <h3>Hızlı Bağlantılar</h3>
                        <ul>
                            <li><a href="#top">Ana Sayfa</a></li>
                            <li><a href="#features">Özellikler</a></li>
                             <li><a href="#generator">Oluşturucu</a></li>
                            <li><a href="#about">Hakkında</a></li>
                            <li><a href="#contact">İletişim</a></li>
                        </ul>
                    </div>
                    
                </div>
            </div>

            <div class="footer-bottom">
                <p>© <?php echo date("Y"); ?> EduNomo AI. Tüm hakları saklıdır.</p>
                <div class="footer-bottom-links">
                    <a href="#">Gizlilik</a><a href="#">Şartlar</a><a href="#">Çerezler</a>
                </div>
            </div>
        </div>
    </footer>

    <!-- "Back to Top" Button -->
    <button id="back-to-top" class="back-to-top" aria-label="Yukarı Çık">
        <i class="fas fa-chevron-up"></i>
    </button>

    <!-- İzlence Modalı -->
    <div id="syllabus-weeks-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-calendar-alt"></i> İzlence Ayarları</h3>
                <button class="modal-close" id="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <!-- Hafta Sayısı Seçimi -->
                <div class="modal-section">
                    <label class="modal-section-label">
                        <i class="fas fa-calendar-week"></i> İzlence Haftaları
                    </label>
                    <p class="modal-section-desc">Konuyu kaç haftalık bir izlenceye bölmek istiyorsunuz?</p>
                    <div class="weeks-selector">
                        <div class="weeks-input">
                            <input type="number" id="weeks-count" min="1" max="24" value="14" class="weeks-count-input">
                            <div class="weeks-controls">
                                <button type="button" id="weeks-increase" class="weeks-btn"><i class="fas fa-plus"></i></button>
                                <button type="button" id="weeks-decrease" class="weeks-btn"><i class="fas fa-minus"></i></button>
                            </div>
                        </div>
                        <span class="weeks-label">hafta</span>
                    </div>
                    <div class="weeks-range">
                        <input type="range" id="weeks-range" min="1" max="24" value="14" class="weeks-range-input">
                        <div class="weeks-range-labels">
                            <span>1</span>
                            <span>8</span>
                            <span>16</span>
                            <span>24</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button id="cancel-syllabus" class="btn btn-outline">İptal</button>
                <button id="confirm-syllabus" class="btn btn-primary">
                    <i class="fas fa-magic"></i> İzlence Oluştur
                </button>
            </div>
        </div>
    </div>

    <!-- Ders Planı Modalı -->
    <div id="lesson-plan-modal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-chalkboard-teacher"></i> Ders Planı Ayarları</h3>
                <button class="modal-close" id="lesson-modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="modal-section">
                    <label class="modal-section-label">
                        <i class="fas fa-info-circle"></i> Ders Planı Bilgisi
                    </label>
                    <p class="modal-section-desc">İzlenceniz başarıyla oluşturuldu! Şimdi her hafta için detaylı ders planları oluşturabilirsiniz.</p>
                </div>

                <!-- Haftalık Ders Sayısı -->
                <div class="modal-section">
                    <label class="modal-section-label">
                        <i class="fas fa-calendar-day"></i> Haftalık Ders Sayısı
                    </label>
                    <p class="modal-section-desc">Her hafta kaç ders işleyeceksiniz?</p>
                    <div class="number-input-group">
                        <button type="button" id="lessons-decrease" class="number-btn"><i class="fas fa-minus"></i></button>
                        <input type="number" id="lessons-per-week" min="1" max="10" value="2" class="number-input">
                        <button type="button" id="lessons-increase" class="number-btn"><i class="fas fa-plus"></i></button>
                        <span class="input-label">ders/hafta</span>
                    </div>
                </div>

                <!-- Ders Süresi -->
                <div class="modal-section">
                    <label class="modal-section-label">
                        <i class="fas fa-clock"></i> Her Ders Süresi
                    </label>
                    <p class="modal-section-desc">Her bir ders kaç dakika sürecek?</p>
                    <div class="number-input-group">
                        <button type="button" id="minutes-decrease" class="number-btn"><i class="fas fa-minus"></i></button>
                        <input type="number" id="minutes-per-lesson" min="20" max="180" step="5" value="40" class="number-input">
                        <button type="button" id="minutes-increase" class="number-btn"><i class="fas fa-plus"></i></button>
                        <span class="input-label">dakika/ders</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button id="skip-lesson-plan" class="btn btn-outline">
                    <i class="fas fa-times"></i> Atla
                </button>
                <button id="create-lesson-plan" class="btn btn-primary">
                    <i class="fas fa-chalkboard-teacher"></i> Ders Planlarını Oluştur
                </button>
            </div>
        </div>
    </div>
    
    <!-- Ders Planı Görüntüleme Modalı -->
    <div id="lesson-plan-view-modal" class="modal">
        <div class="modal-content" style="max-width: 900px;">
            <div class="modal-header">
                <h3 id="lesson-plan-view-title"><i class="fas fa-chalkboard-teacher"></i> Ders Planları</h3>
                <button class="modal-close" id="lesson-plan-view-close">&times;</button>
            </div>
            <div class="modal-body" id="lesson-plan-view-content">
                <!-- Ders planı içeriği buraya yüklenecek -->
            </div>
            <div class="modal-footer">
                <button id="lesson-plan-copy-all" class="btn btn-secondary">
                    <i class="fas fa-copy"></i> Tümünü Kopyala
                </button>
                <button id="lesson-plan-close" class="btn btn-primary">
                    <i class="fas fa-times"></i> Kapat
                </button>
            </div>
        </div>
    </div>
    
    <!-- Pro Sürüm Modal -->
    <div id="pro-version-modal" class="pro-version-modal">
        <div class="pro-version-content">
            <button class="pro-version-close" id="pro-version-close">&times;</button>
            <div class="pro-version-icon">
                <i class="fas fa-crown"></i>
            </div>
            <h3 class="pro-version-title">EduNomo Pro'ya Yükseltin</h3>
            <p class="pro-version-message">
                PDF indirme özelliği Pro sürümde sunulmaktadır. Sınırsız sayıda materyal oluşturma, materyal düzenleme, sunum dosyası indirme gibi birçok avantajdan yararlanmak için Pro sürüme geçiş yapabilirsiniz.
            </p>
            <div class="pro-version-actions">
                <a href="#contact" class="btn btn-primary" id="pro-contact-btn">
                    <i class="fas fa-envelope"></i> İletişime Geç
                </a>
                <button class="btn btn-outline" id="pro-later-btn">
                    <i class="fas fa-times"></i> Daha Sonra
                </button>
            </div>
        </div>
    </div>

    <!-- Libraries -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js" integrity="sha512-16esztaSRplJROstbIIdwX3N97V1+pZvV33ABoG1H2OyTttBxEGkTsoIVsiP1iaTtM8b3+hu2kB6pQ4Clr5yug==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js" integrity="sha512-Ic9xkERjyZ1xgJ5svx3y0u3xrvfT/uPkV99LBwe68xjy/mGtO+4eURHZBW2xW4SZbFrF1Tf090XqB+EVgXnVjw==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js" integrity="sha512-A7AYk1fGKX6S2SsHywmPkrnzTZHrgiVT7GcQkLGDe2ev0aWb8zejytzS8wjo7PGEXKqJOrjQ4oORtnimIRZBtw==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11.7.32/dist/sweetalert2.all.min.js" integrity="sha512-7TkS9w3Frkw5dY6X8nK5/1EiudkWKVBdABdCnVABqHdqHO6R1+wvKBA0+Z8AWMHyYzVgUC6p1s+utEDdn16lAg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <!-- html2pdf.js Kütüphanesi -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" integrity="sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

    <!-- Main JavaScript -->
    <script src="func.js"></script>
</body>
</html>
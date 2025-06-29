<?php
/**
 * CSRF Token API Endpoint
 * Güvenli token üretimi
 */

require_once __DIR__ . '/../config/security.php';

session_start();

Security::setSecurityHeaders();
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    exit;
}

try {
    $token = Security::generateCSRFToken();
    
    echo json_encode([
        "success" => true,
        "csrf_token" => $token
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Token oluşturulamadı"
    ]);
}
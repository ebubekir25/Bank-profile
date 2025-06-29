<?php
/**
 * EduNomo Logger Class
 * Gelişmiş log yönetimi
 */

class Logger {
    private static $logDir = __DIR__ . '/../logs/';
    
    const LEVEL_ERROR = 'ERROR';
    const LEVEL_WARNING = 'WARNING';
    const LEVEL_INFO = 'INFO';
    const LEVEL_DEBUG = 'DEBUG';
    
    /**
     * Log dizinini oluştur
     */
    private static function ensureLogDirectory() {
        if (!is_dir(self::$logDir)) {
            mkdir(self::$logDir, 0755, true);
        }
    }
    
    /**
     * Log mesajı yaz
     */
    private static function writeLog($level, $message, $context = []) {
        self::ensureLogDirectory();
        
        $timestamp = date('Y-m-d H:i:s');
        $ip = Security::getClientIP();
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
        
        $logEntry = [
            'timestamp' => $timestamp,
            'level' => $level,
            'message' => $message,
            'ip' => $ip,
            'user_agent' => $userAgent,
            'context' => $context
        ];
        
        $logLine = json_encode($logEntry, JSON_UNESCAPED_UNICODE) . PHP_EOL;
        
        $filename = self::$logDir . date('Y-m-d') . '.log';
        file_put_contents($filename, $logLine, FILE_APPEND | LOCK_EX);
    }
    
    public static function error($message, $context = []) {
        self::writeLog(self::LEVEL_ERROR, $message, $context);
    }
    
    public static function warning($message, $context = []) {
        self::writeLog(self::LEVEL_WARNING, $message, $context);
    }
    
    public static function info($message, $context = []) {
        self::writeLog(self::LEVEL_INFO, $message, $context);
    }
    
    public static function debug($message, $context = []) {
        if (defined('DEBUG_MODE') && DEBUG_MODE) {
            self::writeLog(self::LEVEL_DEBUG, $message, $context);
        }
    }
    
    /**
     * Mail gönderme logla
     */
    public static function logMailSent($to, $subject, $success = true) {
        $message = $success ? "Mail başarıyla gönderildi" : "Mail gönderme başarısız";
        $context = ['to' => $to, 'subject' => $subject];
        
        if ($success) {
            self::info($message, $context);
        } else {
            self::error($message, $context);
        }
    }
    
    /**
     * API isteği logla
     */
    public static function logAPIRequest($endpoint, $method, $responseCode, $responseTime = null) {
        $context = [
            'endpoint' => $endpoint,
            'method' => $method,
            'response_code' => $responseCode,
            'response_time' => $responseTime
        ];
        
        if ($responseCode >= 200 && $responseCode < 300) {
            self::info("API isteği başarılı", $context);
        } else {
            self::warning("API isteği başarısız", $context);
        }
    }
}
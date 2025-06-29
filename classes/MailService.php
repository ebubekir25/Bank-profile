<?php
/**
 * EduNomo Mail Service
 * Gelişmiş mail gönderme servisi
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require_once __DIR__ . '/../vendor/phpmailer/phpmailer/src/Exception.php';
require_once __DIR__ . '/../vendor/phpmailer/phpmailer/src/PHPMailer.php';
require_once __DIR__ . '/../vendor/phpmailer/phpmailer/src/SMTP.php';

class MailService {
    private $mailer;
    private $config;
    
    public function __construct() {
        $this->config = [
            'host' => $_ENV['MAIL_HOST'] ?? 'smtp.gmail.com',
            'port' => $_ENV['MAIL_PORT'] ?? 587,
            'username' => $_ENV['MAIL_USERNAME'] ?? 'info@edunomo.com',
            'password' => $_ENV['MAIL_PASSWORD'] ?? '',
            'from_email' => $_ENV['MAIL_FROM_EMAIL'] ?? 'info@edunomo.com',
            'from_name' => $_ENV['MAIL_FROM_NAME'] ?? 'EduNomo'
        ];
        
        $this->initializeMailer();
    }
    
    private function initializeMailer() {
        $this->mailer = new PHPMailer(true);
        
        try {
            // SMTP ayarları
            $this->mailer->isSMTP();
            $this->mailer->Host = $this->config['host'];
            $this->mailer->SMTPAuth = true;
            $this->mailer->Username = $this->config['username'];
            $this->mailer->Password = $this->config['password'];
            $this->mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $this->mailer->Port = $this->config['port'];
            
            // Charset ayarları
            $this->mailer->CharSet = 'UTF-8';
            $this->mailer->Encoding = 'base64';
            
            // Gönderen bilgileri
            $this->mailer->setFrom($this->config['from_email'], $this->config['from_name']);
            
        } catch (Exception $e) {
            Logger::error("Mail servisi başlatılamadı", ['error' => $e->getMessage()]);
            throw new Exception("Mail servisi yapılandırılamadı");
        }
    }
    
    /**
     * İletişim formu maili gönder
     */
    public function sendContactForm($name, $email, $message) {
        try {
            // Güvenlik kontrolleri
            if (!Security::validateEmail($email)) {
                throw new Exception("Geçersiz email adresi");
            }
            
            $name = Security::sanitizeString($name);
            $message = Security::sanitizeString($message);
            
            // Rate limiting kontrolü
            if (!Security::checkRateLimit($email, 3, 3600)) {
                throw new Exception("Çok fazla mail gönderme denemesi. Lütfen 1 saat sonra tekrar deneyin.");
            }
            
            // Mail içeriği hazırla
            $this->mailer->clearAddresses();
            $this->mailer->clearReplyTos();
            
            $this->mailer->addAddress($this->config['from_email'], 'EduNomo');
            $this->mailer->addReplyTo($email, $name);
            
            $this->mailer->isHTML(true);
            $this->mailer->Subject = 'EduNomo İletişim Formu: ' . $name;
            
            $htmlBody = $this->getContactFormTemplate($name, $email, $message);
            $this->mailer->Body = $htmlBody;
            $this->mailer->AltBody = "Gönderen: {$name}\nE-posta: {$email}\n\nMesaj:\n{$message}";
            
            // Mail gönder
            $result = $this->mailer->send();
            
            Logger::logMailSent($email, $this->mailer->Subject, true);
            
            return [
                'success' => true,
                'message' => 'Mesajınız başarıyla gönderildi. En kısa sürede sizinle iletişime geçeceğiz.'
            ];
            
        } catch (Exception $e) {
            Logger::logMailSent($email ?? 'unknown', 'Contact Form', false);
            Logger::error("Mail gönderme hatası", ['error' => $e->getMessage()]);
            
            return [
                'success' => false,
                'message' => 'Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin.'
            ];
        }
    }
    
    /**
     * İletişim formu HTML şablonu
     */
    private function getContactFormTemplate($name, $email, $message) {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <style>
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    line-height: 1.6; 
                    color: #333;
                    margin: 0;
                    padding: 0;
                }
                .container { 
                    max-width: 600px; 
                    margin: 0 auto; 
                    padding: 20px;
                    background-color: #f8f9fa;
                }
                .header {
                    background: linear-gradient(135deg, #00867d, #00695c);
                    color: white;
                    padding: 30px 20px;
                    text-align: center;
                    border-radius: 8px 8px 0 0;
                }
                .content {
                    background: white;
                    padding: 30px;
                    border-radius: 0 0 8px 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .info-section {
                    background-color: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    border-left: 4px solid #00867d;
                }
                .label { 
                    font-weight: bold; 
                    color: #00867d;
                    display: inline-block;
                    min-width: 80px;
                }
                .message-content {
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    border: 1px solid #e9ecef;
                    margin-top: 15px;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    color: #6c757d;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🧠 EduNomo İletişim Formu</h1>
                    <p>Yeni bir mesaj aldınız</p>
                </div>
                <div class='content'>
                    <div class='info-section'>
                        <p><span class='label'>Gönderen:</span> " . Security::sanitizeHTML($name) . "</p>
                        <p><span class='label'>E-posta:</span> " . Security::sanitizeHTML($email) . "</p>
                        <p><span class='label'>Tarih:</span> " . date('d.m.Y H:i:s') . "</p>
                        <p><span class='label'>IP Adresi:</span> " . Security::getClientIP() . "</p>
                    </div>
                    <div class='message-content'>
                        <h3>Mesaj İçeriği:</h3>
                        <p>" . nl2br(Security::sanitizeHTML($message)) . "</p>
                    </div>
                </div>
                <div class='footer'>
                    <p>Bu mesaj EduNomo iletişim formu aracılığıyla gönderilmiştir.</p>
                </div>
            </div>
        </body>
        </html>";
    }
    
    /**
     * Otomatik yanıt maili gönder
     */
    public function sendAutoReply($email, $name) {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($email, $name);
            
            $this->mailer->Subject = 'EduNomo - Mesajınızı Aldık';
            $this->mailer->Body = $this->getAutoReplyTemplate($name);
            
            $this->mailer->send();
            Logger::info("Otomatik yanıt gönderildi", ['to' => $email]);
            
        } catch (Exception $e) {
            Logger::warning("Otomatik yanıt gönderilemedi", ['error' => $e->getMessage()]);
        }
    }
    
    /**
     * Otomatik yanıt şablonu
     */
    private function getAutoReplyTemplate($name) {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #00867d, #00695c); color: white; padding: 30px; text-align: center; border-radius: 8px; }
                .content { background: white; padding: 30px; margin-top: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🧠 EduNomo</h1>
                    <p>Mesajınız için teşekkürler!</p>
                </div>
                <div class='content'>
                    <p>Merhaba " . Security::sanitizeHTML($name) . ",</p>
                    <p>Mesajınızı aldık ve en kısa sürede size geri dönüş yapacağız.</p>
                    <p>EduNomo ekibi olarak, eğitim teknolojilerinde yenilikçi çözümler sunmaya devam ediyoruz.</p>
                    <p>Saygılarımızla,<br><strong>EduNomo Ekibi</strong></p>
                </div>
            </div>
        </body>
        </html>";
    }
}
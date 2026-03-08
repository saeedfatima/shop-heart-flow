<?php
/**
 * Email Configuration
 * Uses PHP mail() with SMTP settings from your hosting
 */

class Mailer {
    private $fromEmail;
    private $fromName;
    private $appUrl;

    public function __construct() {
        // Update these for your deployment
        $this->fromEmail = getenv('MAIL_FROM') ?: 'noreply@shaheeda.com';
        $this->fromName = getenv('MAIL_FROM_NAME') ?: 'Shaheeda';
        $this->appUrl = getenv('APP_URL') ?: 'http://localhost:5173';
    }

    /**
     * Send an email using PHP's mail() function
     */
    public function send(string $to, string $subject, string $htmlBody): bool {
        $headers = [
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            'From: ' . $this->fromName . ' <' . $this->fromEmail . '>',
            'Reply-To: ' . $this->fromEmail,
            'X-Mailer: PHP/' . phpversion(),
        ];

        return mail($to, $subject, $htmlBody, implode("\r\n", $headers));
    }

    /**
     * Send verification email
     */
    public function sendVerificationEmail(string $to, string $firstName, string $token): bool {
        $verifyUrl = $this->appUrl . '/verify-email?token=' . urlencode($token);

        $subject = 'Verify your email - ' . $this->fromName;

        $html = $this->getTemplate(
            'Verify Your Email',
            "Hi {$firstName},",
            "Thanks for creating an account! Please verify your email address by clicking the button below.",
            $verifyUrl,
            'Verify Email',
            'This link will expire in 24 hours. If you didn\'t create an account, you can safely ignore this email.'
        );

        return $this->send($to, $subject, $html);
    }

    /**
     * Send welcome email after verification
     */
    public function sendWelcomeEmail(string $to, string $firstName): bool {
        $subject = 'Welcome to ' . $this->fromName . '!';

        $html = $this->getTemplate(
            'Welcome!',
            "Hi {$firstName},",
            "Your email has been verified. You're all set to start shopping!",
            $this->appUrl . '/shop',
            'Start Shopping',
            'Thank you for joining us.'
        );

        return $this->send($to, $subject, $html);
    }

    /**
     * Simple branded HTML email template
     */
    private function getTemplate(
        string $heading,
        string $greeting,
        string $message,
        string $ctaUrl,
        string $ctaText,
        string $footer
    ): string {
        $brandColor = '#000000';
        $brandFg = '#ffffff';

        return <<<HTML
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;">
    <div style="padding:32px 32px 0;text-align:center;">
      <h1 style="margin:0 0 8px;font-size:24px;color:#18181b;">{$heading}</h1>
    </div>
    <div style="padding:24px 32px;">
      <p style="margin:0 0 16px;font-size:16px;color:#18181b;">{$greeting}</p>
      <p style="margin:0 0 24px;font-size:15px;color:#52525b;line-height:1.6;">{$message}</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="{$ctaUrl}" style="display:inline-block;padding:12px 32px;background:{$brandColor};color:{$brandFg};text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">
          {$ctaText}
        </a>
      </div>
      <p style="margin:24px 0 0;font-size:13px;color:#a1a1aa;line-height:1.5;">{$footer}</p>
    </div>
    <div style="padding:16px 32px;border-top:1px solid #f4f4f5;text-align:center;">
      <p style="margin:0;font-size:12px;color:#a1a1aa;">&copy; {$this->fromName}</p>
    </div>
  </div>
</body>
</html>
HTML;
    }
}

import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()


def send_otp_email(to_email: str, username: str, otp_code: str) -> bool:
    """
    Sends a branded 6-digit OTP verification email.
    If SMTP credentials are configured in .env, sends a real live email.
    Otherwise, logs cleanly to console.
    """
    load_dotenv()
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "").strip()
    smtp_from_email = os.getenv("SMTP_FROM_EMAIL", smtp_user or "noreply@stockflow.ai")
    print("\n=======================================================")
    print(f"[EMAIL OTP DISPATCH] 6-Digit Code: {otp_code}")
    print(f"Recipient: {username} <{to_email}>")
    print(f"Subject: Your StockFlow AI Verification Code")
    print(f"Valid for: 5 minutes")
    print("=======================================================\n")

    # If SMTP is configured, attempt real email dispatch
    if smtp_user and smtp_password:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"{otp_code} is your StockFlow AI verification code"
            msg["From"] = f"StockFlow AI Security <{smtp_from_email}>"
            msg["To"] = to_email

            html_body = f"""
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #090d16; color: #e2e8f0; margin: 0; padding: 20px; }}
                .container {{ max-width: 520px; margin: 0 auto; background: #0f172a; border-radius: 16px; border: 1px solid #1e293b; padding: 32px; }}
                .logo {{ font-size: 22px; font-weight: 800; color: #ffffff; margin-bottom: 20px; }}
                .logo span {{ color: #10b981; }}
                .otp-box {{ background: #020617; border: 1px solid #334155; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }}
                .otp-code {{ font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #34d399; margin: 0; }}
                .footer {{ font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #1e293b; padding-top: 16px; text-align: center; }}
              </style>
            </head>
            <body>
              <div class="container">
                <div class="logo">StockFlow <span>AI</span></div>
                <h2 style="color: #ffffff; margin-top: 0;">Verification Code</h2>
                <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
                  Hello <strong>{username}</strong>,<br>
                  Use the 6-digit one-time passcode below to complete your login:
                </p>
                <div class="otp-box">
                  <div class="otp-code">{otp_code}</div>
                </div>
                <p style="color: #94a3b8; font-size: 13px;">
                  ⏱️ This code will expire in <strong>5 minutes</strong>.<br>
                  If you did not request this login, please ignore this email.
                </p>
                <div class="footer">
                  © 2026 StockFlow AI. Enterprise Two-Factor Authentication.
                </div>
              </div>
            </body>
            </html>
            """

            part = MIMEText(html_body, "html")
            msg.attach(part)

            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.sendmail(smtp_from_email, to_email, msg.as_string())

            print(f"[EMAIL SUCCESS] Live email delivered to {to_email}")
            return True
        except Exception as e:
            print(f"[EMAIL ERROR] Could not deliver via SMTP: {e}")
            return False

    return True


def send_password_reset_email(to_email: str, username: str, otp_code: str) -> bool:
    """
    Sends a branded 6-digit Password Reset OTP email.
    """
    load_dotenv()
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "").strip()
    smtp_from_email = os.getenv("SMTP_FROM_EMAIL", smtp_user or "noreply@stockflow.ai")

    print("\n=======================================================")
    print(f"[PASSWORD RESET OTP DISPATCH] 6-Digit Code: {otp_code}")
    print(f"Recipient: {username} <{to_email}>")
    print(f"Subject: Reset Your StockFlow AI Password")
    print(f"Valid for: 10 minutes")
    print("=======================================================\n")

    if smtp_user and smtp_password:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"{otp_code} is your StockFlow AI password reset code"
            msg["From"] = f"StockFlow AI Security <{smtp_from_email}>"
            msg["To"] = to_email

            html_body = f"""
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #090d16; color: #e2e8f0; margin: 0; padding: 20px; }}
                .container {{ max-width: 520px; margin: 0 auto; background: #0f172a; border-radius: 16px; border: 1px solid #1e293b; padding: 32px; }}
                .logo {{ font-size: 22px; font-weight: 800; color: #ffffff; margin-bottom: 20px; }}
                .logo span {{ color: #3b82f6; }}
                .otp-box {{ background: #020617; border: 1px solid #1d4ed8; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }}
                .otp-code {{ font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #60a5fa; margin: 0; }}
                .alert-box {{ background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 12px; margin: 16px 0; }}
                .footer {{ font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #1e293b; padding-top: 16px; text-align: center; }}
              </style>
            </head>
            <body>
              <div class="container">
                <div class="logo">StockFlow <span>AI</span></div>
                <h2 style="color: #ffffff; margin-top: 0;">Password Reset Request</h2>
                <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
                  Hello <strong>{username}</strong>,<br>
                  We received a request to reset your StockFlow AI account password. Use the 6-digit verification code below to authorize this change:
                </p>
                <div class="otp-box">
                  <div class="otp-code">{otp_code}</div>
                </div>
                <p style="color: #94a3b8; font-size: 13px;">
                  ⏱️ This code will expire in <strong>10 minutes</strong>.
                </p>
                <div class="alert-box">
                  <p style="color: #fca5a5; font-size: 12px; margin: 0;">
                    🔒 <strong>Security Warning:</strong> Never share this code with anyone. StockFlow AI will never ask for your code. If you did not initiate this request, your account is secure and you can disregard this email.
                  </p>
                </div>
                <div class="footer">
                  © 2026 StockFlow AI. Enterprise Security Infrastructure.
                </div>
              </div>
            </body>
            </html>
            """

            part = MIMEText(html_body, "html")
            msg.attach(part)

            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.sendmail(smtp_from_email, to_email, msg.as_string())

            print(f"[EMAIL SUCCESS] Password reset email delivered to {to_email}")
            return True
        except Exception as e:
            print(f"[EMAIL ERROR] Could not deliver reset email via SMTP: {e}")
            return False

    return True

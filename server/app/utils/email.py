import smtplib
from email.message import EmailMessage

def send_otp_email(to_email: str, otp: str,loc:str):
    msg = EmailMessage()
    msg.set_content(f"Your OTP is: {otp}")
    if loc=="login":
        msg["Subject"] = "Your Login OTP"
    elif loc=="reset":
        msg["Subject"] = "Your Password Reset OTP"
    elif loc=="registration":
        msg["Subject"] = "Your Registration OTP"
    msg["From"] = "noreply@hospital.com"
    msg["To"] = to_email

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login("bp136897@gmail.com", "xgtx kkwu jati ahlc")
        server.send_message(msg)

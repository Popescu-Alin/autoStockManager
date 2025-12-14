using System.Net;
using System.Net.Mail;

namespace AutoStockManageBackend.Services
{
    public class EmailService
    {
        string emailFrom = "test.mail.licenta@gmail.com";
        string password = "uevs bdqd pzgb ksze";
        public bool SendSetPasswordMail(string userEmail, string token)
        {
            try
            {
                MailMessage mailMessage = new MailMessage();
                mailMessage.From = new MailAddress(emailFrom);
                mailMessage.To.Add(userEmail);
                mailMessage.Subject = "Enable account";
                mailMessage.Body = $"Confirm by clicking the link below <a href=\"http://localhost:4200/auth/enable-account/{token}\">link</a>";
                mailMessage.IsBodyHtml = true;

                SmtpClient smtpClient = new SmtpClient();
                smtpClient.Host = "smtp.gmail.com";
                smtpClient.Port = 587;
                smtpClient.UseDefaultCredentials = false;
                smtpClient.Credentials = new NetworkCredential(emailFrom, password);
                smtpClient.EnableSsl = true;

                smtpClient.Send(mailMessage);
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public void SendChangePassowrdMail(string userEmail, string token)
        {

            try
            {
                MailMessage mailMessage = new MailMessage();
                mailMessage.From = new MailAddress(emailFrom);
                mailMessage.To.Add(userEmail);
                mailMessage.Subject = "Reset Email";
                mailMessage.Body = $"Start reset password process by clicking the link below <a href=\"http://localhost:4200/auth/reset-password/{token}\">link</a>";
                mailMessage.IsBodyHtml = true;

                SmtpClient smtpClient = new SmtpClient();
                smtpClient.Host = "smtp.gmail.com";
                smtpClient.Port = 587;
                smtpClient.UseDefaultCredentials = false;
                smtpClient.Credentials = new NetworkCredential(emailFrom, password);
                smtpClient.EnableSsl = true;

                smtpClient.Send(mailMessage);
            }
            catch (Exception ex)
            {
                throw new BadHttpRequestException("Bad request", 400);
            }
        }

        public bool SendUserActivatedNotificationToAdmin(string adminEmail, string activatedUserName, string activatedUserEmail)
        {
            try
            {
                MailMessage mailMessage = new MailMessage();
                mailMessage.From = new MailAddress(emailFrom);
                mailMessage.To.Add(adminEmail);
                mailMessage.Subject = "New User Account Activated";
                mailMessage.Body = $"A new user has activated their account:<br/><br/>" +
                                  $"<strong>Name:</strong> {activatedUserName}<br/>" +
                                  $"<strong>Email:</strong> {activatedUserEmail}<br/><br/>" +
                                  $"The user can now access the system.";
                mailMessage.IsBodyHtml = true;

                SmtpClient smtpClient = new SmtpClient();
                smtpClient.Host = "smtp.gmail.com";
                smtpClient.Port = 587;
                smtpClient.UseDefaultCredentials = false;
                smtpClient.Credentials = new NetworkCredential(emailFrom, password);
                smtpClient.EnableSsl = true;

                smtpClient.Send(mailMessage);
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

    }
}

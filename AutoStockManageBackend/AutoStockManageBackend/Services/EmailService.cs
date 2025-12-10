using System.Net;
using System.Net.Mail;

namespace AutoStockManageBackend.Services
{
    public class EmailService
    {
        string emailFrom = "test.mail.licenta@gmail.com";
        string password = "hfcn xfav ivfr ayrd";
        public void SendEmailConfirmationMail(string userEmail, string token)
        {
            try
            {
                MailMessage mailMessage = new MailMessage();
                mailMessage.From = new MailAddress(emailFrom);
                mailMessage.To.Add(userEmail);
                mailMessage.Subject = "EmailConfimation";
                mailMessage.Body = $"Confirm by clicking the link below <a href=\"http://localhost:4200/mail-confirmation/{userEmail}/{token}\">link</a>";
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

        public void SendChangePassowrdMail(string userEmail, string token)
        {

            try
            {
                MailMessage mailMessage = new MailMessage();
                mailMessage.From = new MailAddress(emailFrom);
                mailMessage.To.Add(userEmail);
                mailMessage.Subject = "EmailConfimation";
                mailMessage.Body = $"Start reset password process by clicking the link below <a href=\"http://localhost:4200/reset-password/{userEmail}/{token}\">link</a>";
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

    }
}

import SibApiV3Sdk from 'sib-api-v3-sdk';

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

export const transactionalEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

export const sendEmail = async ({ to, subject, htmlContent, senderName = 'Carpooling', senderEmail }) => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.sender = {
    name: senderName,
    email: senderEmail || process.env.GOOGLE_EMAIL,
  };
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;

  try {
    const response = await transactionalEmailApi.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email sent:', response.messageId);
    return response;
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    throw error;
  }
};

export default { transactionalEmailApi, sendEmail };

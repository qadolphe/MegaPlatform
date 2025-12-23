import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const createDomain = async (domainName: string) => {
  try {
    const response = await resend.domains.create({ name: domainName });
    return response;
  } catch (error) {
    console.error('Error creating domain:', error);
    throw error;
  }
};

export const getDomain = async (domainId: string) => {
  try {
    const response = await resend.domains.get(domainId);
    return response;
  } catch (error) {
    console.error('Error getting domain:', error);
    throw error;
  }
};

export const verifyDomain = async (domainId: string) => {
  try {
    const response = await resend.domains.verify(domainId);
    return response;
  } catch (error) {
    console.error('Error verifying domain:', error);
    throw error;
  }
};

export const sendEmail = async ({
  to,
  subject,
  html,
  fromDomain,
  fromName = 'Order Updates',
}: {
  to: string;
  subject: string;
  html: string;
  fromDomain: string;
  fromName?: string;
}) => {
  try {
    const from = `${fromName} <updates@${fromDomain}>`;
    const response = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

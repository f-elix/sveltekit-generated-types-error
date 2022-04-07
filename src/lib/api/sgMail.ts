import type { MailDataRequired } from '@sendgrid/mail';
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(import.meta.env.VITE_SENDGRID_API_KEY as string);

export const sendEmail = async (email: MailDataRequired | MailDataRequired[]) => {
	return sgMail.send(email);
};

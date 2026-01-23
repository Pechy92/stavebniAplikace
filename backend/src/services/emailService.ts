import nodemailer from 'nodemailer';
import pool from '../config/database';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  notificationType: string;
  relatedEntityType: string;
  relatedEntityId: number;
}

export async function sendEmail(options: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html
    });

    // Zaznamenat do databáze
    await pool.query(
      `INSERT INTO email_notifications 
       (recipient_email, subject, body, notification_type, related_entity_type, related_entity_id, sent_successfully) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [options.to, options.subject, options.html, options.notificationType, options.relatedEntityType, options.relatedEntityId, true]
    );

    return info;
  } catch (error: any) {
    // Zaznamenat chybu do databáze
    await pool.query(
      `INSERT INTO email_notifications 
       (recipient_email, subject, body, notification_type, related_entity_type, related_entity_id, sent_successfully, error_message) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [options.to, options.subject, options.html, options.notificationType, options.relatedEntityType, options.relatedEntityId, false, error.message]
    );
    
    throw error;
  }
}

export function getExtraWorkStatusChangeTemplate(extraWorkName: string, status: string, actionUrl: string) {
  const statusTexts: {[key: string]: string} = {
    'submitted_to_foreman': 'odeslána ke kontrole stavbyvedoucímu',
    'returned_to_worker': 'vrácena k dopracování',
    'submitted_to_manager': 'odeslána ke schválení manažerovi',
    'returned_to_foreman': 'vrácena ke zpracování stavbyvedoucímu',
    'approved': 'schválena'
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #DC2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; padding: 10px 20px; background-color: #DC2626; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Stavební aplikace</h1>
        </div>
        <div class="content">
          <h2>Změna statusu vícepráce</h2>
          <p>Vícepráce <strong>${extraWorkName}</strong> byla ${statusTexts[status]}.</p>
          <a href="${actionUrl}" class="button">Zobrazit detail</a>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getShiftAssignmentTemplate(shiftName: string, projectName: string, startDate: string, actionUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #DC2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; padding: 10px 20px; background-color: #DC2626; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Stavební aplikace</h1>
        </div>
        <div class="content">
          <h2>Přiřazení na směnu</h2>
          <p>Byli jste přiřazeni na směnu <strong>${shiftName}</strong></p>
          <p>Stavba: ${projectName}</p>
          <p>Začátek: ${startDate}</p>
          <a href="${actionUrl}" class="button">Zobrazit detail</a>
        </div>
      </div>
    </body>
    </html>
  `;
}

import nodemailer from 'nodemailer';
import pool from '../config/database';

// SMTP transporter pro SendGrid
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
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
    if (!process.env.SENDER_EMAIL || !process.env.SENDGRID_API_KEY) {
      console.log('⚠️ SENDER_EMAIL nebo SENDGRID_API_KEY není nastavený. Email nebyl odeslán.');
      console.log('📧 Email by byl odeslán na:', options.to);
      console.log('📝 Předmět:', options.subject);
      
      await pool.query(
        `INSERT INTO email_notifications 
         (recipient_email, subject, body, notification_type, related_entity_type, related_entity_id, sent_successfully, error_message) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [options.to, options.subject, options.html, options.notificationType, options.relatedEntityType, options.relatedEntityId, false, 'SENDER_EMAIL/SENDGRID_API_KEY není nastavený']
      );
      return null;
    }

    console.log('📧 Připravuji email...');
    console.log('  Od:', process.env.SENDER_EMAIL);
    console.log('  Komu:', options.to);
    console.log('  Předmět:', options.subject);
    console.log('🚀 Odesílám přes SendGrid...');

    const info = await transporter.sendMail({
      from: `Stavební aplikace <${process.env.SENDER_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html
    });

    console.log('✅ Email úspěšně odeslán!');
    console.log('📨 Message ID:', info.messageId);

    await pool.query(
      `INSERT INTO email_notifications 
       (recipient_email, subject, body, notification_type, related_entity_type, related_entity_id, sent_successfully) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [options.to, options.subject, options.html, options.notificationType, options.relatedEntityType, options.relatedEntityId, true]
    );

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('❌ Chyba při odesílání emailu:');
    console.error('  Message:', error.message);
    console.error('  Code:', error.code);
    
    await pool.query(
      `INSERT INTO email_notifications 
       (recipient_email, subject, body, notification_type, related_entity_type, related_entity_id, sent_successfully, error_message) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [options.to, options.subject, options.html, options.notificationType, options.relatedEntityType, options.relatedEntityId, false, `${error.code}: ${error.message}`]
    );
    
    console.warn('⚠️ Email selhal, ale operace pokračuje');
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

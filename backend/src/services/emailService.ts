import sgMail from '@sendgrid/mail';
import pool from '../config/database';

// Nastavit SendGrid API klíč
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

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
    console.log('🚀 Odesílám přes SendGrid Web API...');

    const msg = {
      to: options.to,
      from: process.env.SENDER_EMAIL!,
      subject: options.subject,
      html: options.html
    };

    const response = await sgMail.send(msg);

    console.log('✅ Email úspěšně odeslán!');
    console.log('📨 Response status:', response[0].statusCode);

    await pool.query(
      `INSERT INTO email_notifications 
       (recipient_email, subject, body, notification_type, related_entity_type, related_entity_id, sent_successfully) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [options.to, options.subject, options.html, options.notificationType, options.relatedEntityType, options.relatedEntityId, true]
    );

    return { success: true, statusCode: response[0].statusCode };
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

export function getShiftAssignmentTemplate(shiftName: string, projectName: string, startDate: string, actionUrl: string, tasks: any[] = [], workerInstructions: string = '') {
  const tasksHtml = tasks && tasks.length > 0 
    ? `
      <h3>Úkoly na směně:</h3>
      <ul style="background: white; padding: 15px; border-radius: 5px;">
        ${tasks.map(task => `
          <li style="margin: 10px 0;">
            <strong>${task.title}</strong>
            ${task.description ? `<br/><span style="color: #666;">${task.description}</span>` : ''}
            ${task.estimated_hours ? `<br/><small>Odhadovaný čas: ${task.estimated_hours}h</small>` : ''}
          </li>
        `).join('')}
      </ul>
    `
    : '';

  const instructionsHtml = workerInstructions 
    ? `
      <h3>Instrukce pro pracovníky:</h3>
      <div style="background: white; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${workerInstructions}</div>
    `
    : '';

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
        ul { list-style: none; padding: 0; }
        li { margin: 10px 0; padding: 10px; background: white; border-left: 3px solid #DC2626; }
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
          <p><strong>Stavba:</strong> ${projectName}</p>
          <p><strong>Začátek:</strong> ${startDate}</p>
          ${instructionsHtml}
          ${tasksHtml}
          <a href="${actionUrl}" class="button">Zobrazit detail</a>
        </div>
      </div>
    </body>
    </html>
  `;
}

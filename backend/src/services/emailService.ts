import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import 'isomorphic-fetch';
import pool from '../config/database';

// Inicializace Graph API klienta
function getGraphClient() {
  if (!process.env.AZURE_TENANT_ID || !process.env.AZURE_CLIENT_ID || !process.env.AZURE_CLIENT_SECRET) {
    return null;
  }

  const credential = new ClientSecretCredential(
    process.env.AZURE_TENANT_ID,
    process.env.AZURE_CLIENT_ID,
    process.env.AZURE_CLIENT_SECRET
  );

  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => {
        const token = await credential.getToken('https://graph.microsoft.com/.default');
        return token?.token || '';
      }
    }
  });
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
    const client = getGraphClient();
    
    if (!client) {
      console.log('⚠️ Microsoft Graph není nakonfigurován. Email nebyl odeslán.');
      console.log('📧 Email by byl odeslán na:', options.to);
      console.log('📝 Předmět:', options.subject);
      
      // Zaznamenat do databáze jako neodeslaný
      await pool.query(
        `INSERT INTO email_notifications 
         (recipient_email, subject, body, notification_type, related_entity_type, related_entity_id, sent_successfully, error_message) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [options.to, options.subject, options.html, options.notificationType, options.relatedEntityType, options.relatedEntityId, false, 'Microsoft Graph není nakonfigurován']
      );
      return null;
    }

    // Odeslat email přes Microsoft Graph API
    const sendMail = {
      message: {
        subject: options.subject,
        body: {
          contentType: 'HTML',
          content: options.html
        },
        toRecipients: [
          {
            emailAddress: {
              address: options.to
            }
          }
        ]
      },
      saveToSentItems: true
    };

    await client
      .api(`/users/${process.env.SENDER_EMAIL}/sendMail`)
      .post(sendMail);

    console.log('✅ Email odeslán:', options.to);

    // Zaznamenat do databáze
    await pool.query(
      `INSERT INTO email_notifications 
       (recipient_email, subject, body, notification_type, related_entity_type, related_entity_id, sent_successfully) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [options.to, options.subject, options.html, options.notificationType, options.relatedEntityType, options.relatedEntityId, true]
    );

    return { success: true };
  } catch (error: any) {
    console.error('❌ Chyba při odesílání emailu:', error.message);
    
    // Zaznamenat chybu do databáze
    await pool.query(
      `INSERT INTO email_notifications 
       (recipient_email, subject, body, notification_type, related_entity_type, related_entity_id, sent_successfully, error_message) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [options.to, options.subject, options.html, options.notificationType, options.relatedEntityType, options.relatedEntityId, false, error.message]
    );
    
    // Nepropagovat chybu - notifikace není kritická
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

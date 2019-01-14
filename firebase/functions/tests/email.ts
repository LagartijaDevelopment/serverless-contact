import * as previewEmail from 'preview-email';
import * as pug from 'pug';
import { template } from '../src/mail-template';

// Test data
const email = 'email@example.com';
const toEamil = 'toEmail@example.com';
const subject = 'Example of subject';
const html = pug.render(template, { data: { email, subject } })

const message = {
    from: email,
    to: toEamil,
    subject,
    html
}

previewEmail(message).then(console.log).catch(console.log);
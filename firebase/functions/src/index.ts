import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from "body-parser";
import * as mail from '@sendgrid/mail';
import * as pug from 'pug';
import { template } from './mail-template';

mail.setApiKey(functions.config().sendgrid.key);
admin.initializeApp();
const db = admin.firestore();

const main = express();
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));

main.use(async function (req, res, next) {
    const origin = await req.header('Origin') || req.header('origin');
    if (validateOrigin(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    }
    next();
});

main.post('/:to', async (req, res) => {
    const to = await db.collection('recipients').doc(req.params.to).get();
    const mailData: any = {
        to: to.data(),
        from: {
            email: req.body.email,
            name: req.body.name
        },
        subject: req.body.subject || 'Contact message.',
        html: pug.render(template, { fields: Object.keys(req.body) }),
        substitutions: req.body
    };
    function respond(status: number, data: any = {}) {
        data.statusCode = status;
        data.mailData = mailData;
        data.params = req.params;
        res.status(status).json(data);
    }
    if (!req.body.email) {
        respond(422, { error: 'Email address is required.' });
        return;
    }
    await mail.send(mailData, false, function (error, data) {
        if (error) {
            respond(500, { error })
        } else {
            respond(data[0].statusCode)
        }
    });
});

async function validateOrigin(testOrigin) {
    const sites = await db.collection('sites').get();
    let valid: boolean = false;
    sites.forEach(site => {
        const data = site.data();
        if (data.origin === testOrigin) {
            valid = true;
        }
    });
    return valid;
}
export const api = functions.https.onRequest(main);
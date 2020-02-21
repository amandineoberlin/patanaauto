const Promise = require('bluebird');
const mailer = require('nodemailer-promise');

const { auth, host, port } = require('../config/access').mailer;

const sendEmail = mailer.config({ host, port, auth });
const mailingOptions = ({ name, email, subject, message }) => {
  const intro = '<h3>Un utilisateur du site web www.patanaauto.fr vous a envoyé'
  + ' un message via le formulaire de contact:</h3><br/>';
  const content = `<p><strong>Message: </strong>${message}</p><br/>`;
  const coords = `<p><strong>nom: </strong>${name}</p><p><strong>email: </strong>${email}</p>`;
  const html = `${intro} ${coords} ${content}`;

  return { from: auth.user, to: auth.user, subject, html }
}

const sendForm = Promise.coroutine(function* (req, res) {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return Promise.resolve({ accepted: null, rejected: null });

  return sendEmail(mailingOptions(req.body))
    .then(result => res.send(result));
});

module.exports = (app) => app.post('/send-contact-form', sendForm);

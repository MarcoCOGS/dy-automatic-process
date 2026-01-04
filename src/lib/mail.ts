import sgMail from '@sendgrid/mail';

import { ServerConfig } from './server-config';

sgMail.setApiKey(ServerConfig.sendGridApiKey);

export default sgMail;

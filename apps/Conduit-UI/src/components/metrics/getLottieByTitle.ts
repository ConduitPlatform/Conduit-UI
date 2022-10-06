import Email from '../../assets/lotties/email.json';
import Schemas from '../../assets/lotties/schemas.json';
import Chat from '../../assets/lotties/chat.json';
import Endpoints from '../../assets/lotties/endpoints.json';
import Files from '../../assets/lotties/files.json';
import Forms from '../../assets/lotties/forms.json';
import Size from '../../assets/lotties/size.json';
import Containers from '../../assets/lotties/containers.json';
import SendEmail from '../../assets/lotties/sendEmail.json';
import Users from '../../assets/lotties/users.json';
import Folders from '../../assets/lotties/folders.json';
import SmsSent from '../../assets/lotties/smsSent.json';

export const getLottieByTitle = (title: string) => {
  switch (title) {
    case 'Folders':
      return Folders;
    case 'Email templates':
      return Email;
    case 'Chat rooms':
      return Chat;
    case 'Endpoints':
      return Endpoints;
    case 'Files':
      return Files;
    case 'Forms':
      return Forms;
    case 'Folders':
      return Schemas;
    case 'Containers':
      return Containers;
    case 'Size (bytes)':
      return Size;
    case 'Sent emails':
      return SendEmail;
    case 'Schemas':
      return Schemas;
    case 'Logged in users':
      return Users;
    case 'SMS Sent':
      return SmsSent;
    default:
      return undefined;
  }
};

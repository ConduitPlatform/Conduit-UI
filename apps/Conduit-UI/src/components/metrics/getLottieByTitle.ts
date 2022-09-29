import Email from '../../assets/lotties/email.json';
import Schemas from '../../assets/lotties/schemas.json';
import Chat from '../../assets/lotties/chat.json';
import Endpoints from '../../assets/lotties/endpoints.json';
import Files from '../../assets/lotties/files.json';
import Forms from '../../assets/lotties/forms.json';

export const getLottieByTitle = (title: string) => {
  switch (title) {
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
    default:
      return Schemas;
  }
};

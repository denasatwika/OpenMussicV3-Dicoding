import ExportsHandler from './handler.js';
import routes from './route.js';

export default {
  name: 'RabbitMQExports',
  version: '1.0.0',
  register: async (server, { validator, playlistsService, service }) => {
    const exportHandler = new ExportsHandler(service, validator, playlistsService);

    server.route(routes(exportHandler));
  },

};

import ExportsHandler from './handler.js';
import routes from './route.js';

export default {
  name: 'RabbitMQExports',
  version: '1.0.0',
  register: async (server, { validator, playlistsService, exportService }) => {
    const exportHandler = new ExportsHandler(exportService, validator, playlistsService);

    server.route(routes(exportHandler));
  },

};

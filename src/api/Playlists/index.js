import PlaylistsHandler from './AllHandler.js';
import routes from './routes.js';

export default {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const handler = new PlaylistsHandler(service, validator);

    const playlistsHandlers = {
      postPlaylistHandler: handler.postPlaylistHandler,
      getPlaylistsHandler: handler.getPlaylistsHandler,
      deletePlaylistByIdHandler: handler.deletePlaylistByIdHandler,
      postSongToPlaylistHandler: handler.postSongToPlaylistHandler,
      getSongsInPlaylistHandler: handler.getSongsInPlaylistHandler,
      deleteSongFromPlaylistHandler: handler.deleteSongFromPlaylistHandler,
      getPlaylistActivitiesHandler: handler.getPlaylistActivitiesHandler,
    };

    server.route(routes(playlistsHandlers));
  },
};

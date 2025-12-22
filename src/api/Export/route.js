const routes = (handler) => [
  {
    method: 'POST',
    path: '/export/playlists',
    handler: handler.postExportPlaylistHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
];

export default routes;

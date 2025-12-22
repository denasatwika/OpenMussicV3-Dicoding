const routes = (handler) => [
  {
    method: 'POST',
    path: '/export/playlists',
    handler: handler.postExportPlaylistHandler,
    options: {
      auth: 'notesapp_jwt',
    },
  },
];

export default routes;

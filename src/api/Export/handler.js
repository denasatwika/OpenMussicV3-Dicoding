class ExportsHandler {
  constructor(service, validator, playlistsService) {
    this.service = service;
    this.validator = validator;
    this.playlistsService = playlistsService;

    this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
  }

  async postExportPlaylistHandler(request, h) {
    this.validator.validateExportPlaylistPayload(request.payload);
    const { playlistId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this.playlistsService.verifyPlaylistAccess(playlistId, userId);

    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this.service.sendMessage('export:playlists', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);
    return response;
  }
}

export default ExportsHandler;

class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, validator, userService) {
    this.collaborationsService = collaborationsService;
    this.playlistsService = playlistsService;
    this.validator = validator;
    this.userService = userService;

    this.postCollaborationHandler = this.postCollaborationHandler.bind(this);
    this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this);
  }

  async postCollaborationHandler(request, h) {
    this.validator.validateCollaborationPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this.playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    await this.userService.getUserById(userId);

    const collaborationId = await this.collaborationsService.addCollaboration(playlistId, userId);

    const response = h.response({
      status: 'success',
      message: 'Kolaborasi berhasil ditambahkan',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request) {
    try {
      this.validator.validateCollaborationPayload(request.payload);
      const { id: credentialId } = request.auth.credentials;
      const { playlistId, userId } = request.payload;

      console.log(`[DEBUG] Deleting Collaboration. Playlist: ${playlistId}, TargetUser: ${userId}, Requester: ${credentialId}`);

      await this.playlistsService.verifyPlaylistAccess(playlistId, credentialId);
      console.log('[DEBUG] Requester is Owner, proceeding to delete...');

      await this.collaborationsService.deleteCollaboration(playlistId, userId);

      return {
        status: 'success',
        message: 'Kolaborasi berhasil dihapus',
      };
    } catch (error) {
      console.error('[DEBUG ERROR] Collaboration Delete:', error.message);
      throw error;
    }
  }
}

export default CollaborationsHandler;

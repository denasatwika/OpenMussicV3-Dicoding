class AlbumsHandler {
  constructor(service, storageService, validator) {
    this.service = service;
    this.storageService = storageService;
    this.validator = validator;

    this.postAlbumLikeHandler = this.postAlbumLikeHandler.bind(this);
    this.deleteAlbumLikeHandler = this.deleteAlbumLikeHandler.bind(this);
    this.getAlbumLikesHandler = this.getAlbumLikesHandler.bind(this);
    this.postUploadCoverHandler = this.postUploadCoverHandler.bind(this);
  }

  async postAlbumLikeHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.service.addAlbumLike(credentialId, albumId);

    const response = h.response({
      status: 'success',
      message: 'Berhasil menyukai album',
    });
    response.code(201);
    return response;
  }

  async deleteAlbumLikeHandler(request) {
    const { id: albumId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.service.deleteAlbumLike(credentialId, albumId);

    return {
      status: 'success',
      message: 'Berhasil membatalkan suka pada album',
    };
  }

  async getAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;

    const { likes, source } = await this.service.getAlbumLikes(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });

    response.header('X-Data-Source', source);

    return response;
  }

  async postUploadCoverHandler(request, h) {
    console.log('Payload diterima:', request.payload);
    const { cover } = request.payload;

    if (cover) {
      console.log('Detail File (hapi):', cover.hapi);
      console.log('Headers File:', cover.hapi.headers);
    } else {
      console.log('File "cover" tidak ditemukan di payload!');
    }

    const albumId = request.params.id;

    this.validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this.storageService.writeFile(cover, cover.hapi);
    const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;

    await this.service.editAlbumCover(albumId, coverUrl);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }
}

export default AlbumsHandler;

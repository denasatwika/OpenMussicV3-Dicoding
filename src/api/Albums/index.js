import PostAlbum from './handlerAlbum/postAlbum.js';
import GetAlbumById from './handlerAlbum/getAlbum.js';
import EditAlbum from './handlerAlbum/editAlbum.js';
import DeleteAlbum from './handlerAlbum/deleteAlbum.js';
import AlbumsHandler from './handlerAlbum/albumLike.js';
import routes from './route.js';

export default {
  name: 'albums',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const postAlbum = new PostAlbum(service, validator.album);
    const getAlbum = new GetAlbumById(service);
    const editAlbum = new EditAlbum(service, validator.album);
    const deleteAlbum = new DeleteAlbum(service);
    const albumLikesHandler = new AlbumsHandler(service, validator.upload);

    const albumsHandlers = {
      postAlbumHandler: postAlbum.postAlbumHandler,
      getAlbumByIdHandler: getAlbum.getAlbumByIdHandler,
      editAlbumByIdHandler: editAlbum.editAlbumByIdHandler,
      deleteAlbumByIdHandler: deleteAlbum.deleteAlbumByIdHandler,
      postAlbumLikeHandler: albumLikesHandler.postAlbumLikeHandler,
      deleteAlbumLikeHandler: albumLikesHandler.deleteAlbumLikeHandler,
      getAlbumLikesHandler: albumLikesHandler.getAlbumLikesHandler,
      postUploadCoverHandler: albumLikesHandler.postUploadCoverHandler.bind(albumLikesHandler),

    };

    server.route(routes(albumsHandlers));
  },

};

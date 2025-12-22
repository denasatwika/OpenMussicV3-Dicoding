import 'dotenv/config';
import Hapi from '@hapi/hapi';
import Jwt from '@hapi/jwt';
import path from 'path';
import Inert from '@hapi/inert';
import { fileURLToPath } from 'url';

import CollaborationsValidator from './validator/collaborations/index.js';
import CollaborationsService from './services/postgres/colaborationService.js';
import Collaborations from './api/Collaborations/index.js';

import PlaylistService from './services/postgres/playlistService.js';
import PlaylistValidator from './validator/playlist/index.js';
import Playlists from './api/Playlists/index.js';

import AlbumService from './services/postgres/albumService.js';
import SongService from './services/postgres/songService.js';
import AuthService from './services/postgres/authService.js';

import ClientError from './exceptions/ClientError.js';
import TokenManager from './tokenize/TokenManager.js';

import AlbumValidator from './validator/albums/index.js';
import SongValidator from './validator/songs/index.js';
import AuthValidator from './validator/auth/index.js';

import Authentications from './api/Auth/index.js';
import Albums from './api/Albums/index.js';
import Songs from './api/Songs/index.js';

import CacheService from './services/redis/cacheService.js';

import ExportValidator from './validator/export/index.js';
import ProducerService from './services/rabbitMQ/producerService.js';
import Export from './api/Export/index.js';

import StorageService from './services/storage/storageService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const init = async () => {
  const collaborationsService = new CollaborationsService();
  const playlistService = new PlaylistService(collaborationsService);
  const cacheService = new CacheService();
  const albumService = new AlbumService(cacheService);
  const songService = new SongService();
  const authService = new AuthService();
  const storageService = new StorageService(path.resolve(__dirname, 'api/Albums/covers'));

  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: 3600,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: Playlists,
      options: {
        service: playlistService,
        validator: PlaylistValidator,
      },
    },
    {
      plugin: Albums,
      options: {
        service: albumService,
        storageService: storageService,
        validator: AlbumValidator,
      },
    },
    {
      plugin: Songs,
      options: {
        service: songService,
        validator: SongValidator,
      },
    },
    {
      plugin: Authentications,
      options: {
        authService,
        tokenManager: TokenManager,
        validator: AuthValidator,
      },
    },
    {
      plugin: Collaborations,
      options: {
        collaborationsService,
        playlistsService: playlistService,
        validator: CollaborationsValidator,
        userService: authService,
      },
    },
    {
      plugin: Export,
      options: {
        service: ProducerService,
        validator: ExportValidator,
        playlistsService: playlistService,
      },
    },
  ]);

  server.route({
    method: 'GET',
    path: '/upload/images/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, 'api/Albums/covers'),
      },
    },
  });

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    if (response.isServer) {
      console.error(response);
      const newResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();

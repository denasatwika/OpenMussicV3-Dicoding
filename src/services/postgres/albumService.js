import { nanoid } from 'nanoid';
import { Pool } from 'pg';
import mapDbAlbumToModel from '../../../utils/album.js';
import InvariantError from '../../exceptions/InvariantError.js';
import NotFoundError from '../../exceptions/NotFoundError.js';
import ClientError from '../../exceptions/ClientError.js';

class AlbumService {
  constructor(cacheService) {
    this.pool = new Pool();
    this.cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16);
    const createAt = new Date().toISOString();
    const updateAt = createAt;

    const query = {
      text: 'INSERT INTO albums (id, name, year, create_at, update_at) VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, year, createAt, updateAt],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const songList = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [id],
    };

    const resultSong = await this.pool.query(songList);

    const album = mapDbAlbumToModel(result.rows[0]);
    album.songs = resultSong.rows;

    return album;
  }

  async editAlbumById(id, { name, year }) {
    const updateAt = new Date().toISOString();

    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, update_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updateAt, id],
    };
    const result = await this.pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async addAlbumLike(userId, albumId) {
    await this.getAlbumById(albumId);

    const queryCheckLike = {
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };
    const resultCheck = await this.pool.query(queryCheckLike);

    if (resultCheck.rowCount > 0) {
      throw new ClientError('Album sudah pernah disukai');
    }

    const id = nanoid(16);
    const query = {
      text: 'INSERT INTO user_album_likes (id, user_id, album_id) VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menyukai album');
    }

    await this.cacheService.delete(`likes:${albumId}`);
  }

  async deleteAlbumLike(userId, albumId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this.pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('Gagal membatalkan like. Like tidak ditemukan');
    }
    await this.cacheService.delete(`likes:${albumId}`);
  }

  async getAlbumLikes(albumId) {
    try {
      const result = await this.cacheService.get(`likes:${albumId}`);
      return {
        likes: parseInt(result, 10),
        source: 'cache',
      };
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(id) AS likes FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this.pool.query(query);
      const likesCount = parseInt(result.rows[0].likes, 10);

      await this.cacheService.set(`likes:${albumId}`, likesCount.toString());

      return {
        likes: likesCount,
        source: 'database',
      };
    }
  }

  async editAlbumCover(id, cover) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
      values: [cover, id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui sampul. Id tidak ditemukan');
    }
  }
}

export default AlbumService;

import InvariantError from '../../exceptions/InvariantError.js';
import { AlbumSchema, ValidateHeadersSchema } from './schema.js';

const AlbumValidator = {
  validateAlbumPayload: (payload) => {
    const validationResult = AlbumSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(`Invalid album payload: ${validationResult.error.message}`);
    }
  },

  validateImageHeaders: (headers) => {
    const validationResult = ValidateHeadersSchema.validate(headers);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

export default AlbumValidator;

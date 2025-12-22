import ExportPlaylistSchema from './schema.js';
import InvariantError from '../../exceptions/InvariantError.js';

const ExportValidator = {
  validateExportPlaylistPayload: (payload) => {
    const validationResult = ExportPlaylistSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(`Invalid export playlist payload: ${validationResult.error.message}`);
    }
  },
};

export default ExportValidator;

import ValidateHeadersSchema from './schema.js';
import InvariantError from '../../exceptions/InvariantError.js';

const UploadsValidator = {
  validateImageHeaders: (headers) => {
    const validationResult = ValidateHeadersSchema.validate(headers);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

export default UploadsValidator;

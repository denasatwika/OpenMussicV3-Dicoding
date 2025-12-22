import Joi from 'joi';

const ExportPlaylistSchema = Joi.object({
  targetEmail: Joi.string().email().required(),
});

export default ExportPlaylistSchema;

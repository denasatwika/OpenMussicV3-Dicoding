import Joi from 'joi';

const ExportPlaylistSchema = Joi.object({
  playlistId: Joi.string().required(),
  targetEmail: Joi.string().email().required(),
});

export default ExportPlaylistSchema;

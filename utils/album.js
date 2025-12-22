const mapDbAlbumtoModel = ({
  id,
  name,
  year,
  cover,
}) => ({
  id,
  name,
  year,
  coverUrl: cover ? `http://${process.env.HOST}:${process.env.PORT}/upload/images/${cover}` : null,
});

export default mapDbAlbumtoModel;

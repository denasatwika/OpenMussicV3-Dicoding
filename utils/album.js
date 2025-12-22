const mapDbAlbumtoModel = ({
  id,
  name,
  year,
  cover,
}) => ({
  id,
  name,
  year,
  coverUrl: cover || null,
});

export default mapDbAlbumtoModel;

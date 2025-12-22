import 'dotenv/config';
import amqp from 'amqplib';
import nodemailer from 'nodemailer';
import { Pool } from 'pg';

const init = async () => {
  const pool = new Pool();
  const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
  const channel = await connection.createChannel();

  const queue = 'export:playlists';
  await channel.assertQueue(queue, { durable: true });

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  console.log(`Consumer berjalan pada queue: ${queue}`);

  channel.consume(queue, async (message) => {
    try {
      const { playlistId, targetEmail } = JSON.parse(message.content.toString());

      const playlistQuery = await pool.query('SELECT id, name FROM playlists WHERE id = $1', [playlistId]);
      const playlist = playlistQuery.rows[0];

      const songsQuery = await pool.query(
        'SELECT songs.id, songs.title, songs.performer FROM songs JOIN playlist_songs ON songs.id = playlist_songs.song_id WHERE playlist_songs.playlist_id = $1',
        [playlistId],
      );
      playlist.songs = songsQuery.rows;

      const emailContent = {
        from: 'OpenMusic App',
        to: targetEmail,
        subject: 'Ekspor Playlist',
        text: `Terlampir hasil ekspor playlist ${playlist.name}`,
        attachments: [
          {
            filename: 'playlists.json',
            content: JSON.stringify({ playlist }),
          },
        ],
      };

      await transporter.sendMail(emailContent);
      channel.ack(message);
    } catch (error) {
      console.error(error);
    }
  }, { noAck: false });
};

init();

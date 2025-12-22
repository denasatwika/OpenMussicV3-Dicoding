import amqp from 'amqplib';
import nodemailer from 'nodemailer';

const init = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
  const channel = await connection.createChannel();
  await channel.assertQueue(
    'export:playlists',
    { durable: true },
  );

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  channel.consume('export:playlists', async (message) => {
    const { playlistId, targetEmail } = JSON.parse(message.content.toString());

    channel.ack(message);
  });
};

init();

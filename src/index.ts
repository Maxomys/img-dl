import app from './app';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.listen(3000, () => {
  console.log(`Listening on port ${PORT}`);
});

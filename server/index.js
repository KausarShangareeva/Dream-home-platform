import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';

import depositsRouter from './routes/deposits.js';
import dreamsRouter from './routes/dreams.js';
import sadaqaRouter from './routes/sadaqa.js';
import personalRouter from './routes/personal.js';
import booksRouter from './routes/books.js';
import quranRouter from './routes/quran.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json({ limit: '5mb' })); // 5mb so custom-dream photos (data URLs) fit

app.get('/', (req, res) => res.json({ ok: true, service: 'dream-home-server' }));

app.use('/api/deposits', depositsRouter);
app.use('/api/dreams', dreamsRouter);
app.use('/api/sadaqa', sadaqaRouter);
app.use('/api/personal', personalRouter);
app.use('/api/personal', booksRouter);
app.use('/api/personal', quranRouter);

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });

import 'dotenv/config'; // must be first lines
import express, { Request, Response } from 'express';
import cors from 'cors';

import genericRoutes from '@routes/generic';
import pokemonRoutes from '@routes/pokemon'; // add this line for pokemon posts
import helperBotRoutes from '@routes/helperBot';
import authRoutes from '@routes/auth'; // add this line for auth routes

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/generic', genericRoutes);
app.use('/api/pokemon', pokemonRoutes); // add this line for pokemon posts
app.use('/api/pokemon/:id', pokemonRoutes);
app.use('/api/helperbot', helperBotRoutes);
app.use('/api/auth', authRoutes); // add this line for auth routes

app.get('/api/hello', (req: Request, res: Response) => {
  res.json({ message: 'Hello from Express!' });
});

app.get('/api/poke', async (req: Request, res: Response) => {
  const response = await fetch('https://pokeapi.co/api/v2/pokemon/1');
  const data = await response.json();
  res.json(data);
  console.log('Poke API response:', data);
});

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);

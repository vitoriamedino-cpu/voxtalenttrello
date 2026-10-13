
import 'dotenv/config';
import express from 'express';
import { neon } from '@neondatabase/serverless';

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return res.status(500).json({
        ok: false,
        message: 'DATABASE_URL não configurada no servidor.',
      });
    }

    const sql = neon(databaseUrl);
    const result = await sql`SELECT NOW() AS horario`;

    return res.json({
      ok: true,
      database: 'conectado',
      horario: result[0].horario,
    });
  } catch (error) {
    console.error('Erro de conexão com o banco:', error);

    return res.status(500).json({
      ok: false,
      message: 'Não foi possível conectar ao banco de dados.',
    });
  }
});

app.listen(port, () => {
  console.log(`VoxTalent API iniciada na porta ${port}`);
});

import express from 'express';
import fs from 'fs/promises';
import path from 'path';

interface Cell {
  id: string;
  content: string;
  type: 'text' | 'code';
}

interface LocalApiError {
  code: string;
}

export const createCellsRouter = (filename: string, dir: string) => {
  const router = express.Router();
  router.use(express.json());

  const fullPath = path.join(dir, filename);

  router.get('/cells', async (req, res) => {
    const isLocalApiError = (err: any): err is LocalApiError => {
      return typeof err.code === 'string';
    };
    try {
      // Read the file
      // Parse a list of cells out of it
      const result = await fs.readFile(fullPath, { encoding: 'utf-8' });

      // Send list of cells back to browser
      res.send(JSON.parse(result));
    } catch (err) {
      // If read throws an error - inspect the error,
      // see if it says that the file doesn't exist
      if (isLocalApiError(err)) {
        if (err.code === 'ENOENT') {
          await fs.writeFile(fullPath, '[]', 'utf-8');
          res.send([]);
        } else {
          throw err;
        }
      }
    }
  });

  router.post('/cells', async (req, res) => {
    // Take list of cells from req obj and serialize them
    const { cells }: { cells: Cell[] } = req.body;

    // Write cells in the file
    await fs.writeFile(fullPath, JSON.stringify(cells), 'utf-8');

    res.send({ status: 'ok' });
  });

  return router;
};

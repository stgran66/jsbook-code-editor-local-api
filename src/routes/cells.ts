import express from 'express';
import fs from 'fs/promises';
import syncFs from 'fs';
import path from 'path';

interface Cell {
  id: string;
  content: string;
  type: 'text' | 'code';
}

interface LocalApiError {
  code: string;
}

const defaultCells = [
  {
    content:
      '# JS-notebook\n\nThis is an interactive coding environment. You can write JavaScript, see it executed, and write comprehensive documentation using markdown.\n\n- Click any text cell (including this one) to edit it\n- The code in each code editor is all joined together into one file. If you define a variable in cell #1, you can refer to it in any following cell!\n- You can show any React component, string, number, or anything else by calling the `show ` function. This is a function built into this environment. Call show multiple times to show multiple values\n- Re-order or delete cells using buttons on the top right\n- Format code with Prettier using format button\n- Add new cells by hovering on the divider between each cell\n\nAll of your changes get saved to the file you opened JS-notebook with. So if you ran `npx js-notebook-stgran serve test.js`, all of the text and code you write will be saved to the `test.js` file.\n',
    type: 'text',
    id: 'djfy9',
  },
  {
    content:
      "import { useState } from 'react';\n\nconst Counter = () => {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <button\n        onClick={() => {\n          setCount(count + 1);\n        }}\n      >\n        Click\n      </button>\n      <h3>Count: {count}</h3>\n    </div>\n  );\n};\n// Display any variable or React Component by calling 'show'\nshow(Counter); //React Component can be displayed as jsx (show(<Counter/>))",
    type: 'code',
    id: '2bl4q',
  },
  {
    content:
      'const App = () => {\n  return (\n    <div>\n      <h3>App says hi!</h3>\n      <i>Counter component will be rendered below...</i>\n      <hr />\n      {/* Counter was declared in the previous cell - \n        we can reference it here! */}\n      <Counter />\n    </div>\n  );\n};\n\nshow(<App/>)',
    type: 'code',
    id: '4o15k',
  },
];

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
      if (syncFs.existsSync(fullPath)) {
        const result = await fs.readFile(fullPath, { encoding: 'utf-8' });
        const cells = JSON.parse(result);
        // Send list of cells back to browser
        res.send(cells.length > 0 ? cells : defaultCells);
      } else {
        await fs.writeFile(fullPath, JSON.stringify(defaultCells), 'utf-8');
        res.send(defaultCells);
      }
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

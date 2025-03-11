import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { getArticleStats, createArticleStat } from './statsQueries';

const router = Router();

// Função de utilidade para validação
const validateRequest = (req: Request, res: Response): boolean => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
};

// POST - Criar estatísticas
router.post(
  '/',
  [
    body('articleSlug').isString().trim().escape(),
    body('stat').isString().trim().escape(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    if (!validateRequest(req, res)) return;

    const { articleSlug, stat } = req.body;

    try {
      await createArticleStat(articleSlug, stat);

      res.status(201).json({
        articleSlug,
        stat,
      });
    } catch (error) {
      console.error('Error creating article stat:', error);
      res.status(500).json({ error: 'Erro ao criar estatística do artigo' });
    }
  }
);

// GET - Buscar estatísticas
router.get(
  '/:articleSlug',
  async (req: Request, res: Response): Promise<void> => {
    const { articleSlug } = req.params;

    try {
      const stats = await getArticleStats(articleSlug);

      res.json({
        articleSlug,
        stats,
      });
    } catch (error) {
      console.error('Error fetching article stats:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas do artigo' });
    }
  }
);

export default router;
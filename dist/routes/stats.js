"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const statsQueries_1 = require("./statsQueries");
const router = (0, express_1.Router)();
// Função de utilidade para validação
const validateRequest = (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return false;
    }
    return true;
};
// POST - Criar estatísticas
router.post('/', [
    (0, express_validator_1.body)('articleSlug').isString().trim().escape(),
    (0, express_validator_1.body)('stat').isString().trim().escape(),
], async (req, res) => {
    if (!validateRequest(req, res))
        return;
    const { articleSlug, stat } = req.body;
    try {
        await (0, statsQueries_1.createArticleStat)(articleSlug, stat);
        res.status(201).json({
            articleSlug,
            stat,
        });
    }
    catch (error) {
        console.error('Error creating article stat:', error);
        res.status(500).json({ error: 'Erro ao criar estatística do artigo' });
    }
});
// GET - Buscar estatísticas
router.get('/:articleSlug', async (req, res) => {
    const { articleSlug } = req.params;
    try {
        const stats = await (0, statsQueries_1.getArticleStats)(articleSlug);
        res.json({
            articleSlug,
            stats,
        });
    }
    catch (error) {
        console.error('Error fetching article stats:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas do artigo' });
    }
});
exports.default = router;

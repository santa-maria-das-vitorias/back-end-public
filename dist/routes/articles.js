"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const articlesRaw = await prisma.article.findMany({
            select: {
                id: true,
                title: true,
                slug: true,
                date: true,
                image: true,
                have_image: true,
                content: false,
                author: true,
                categories: {
                    select: {
                        category: {
                            select: {
                                id: true,
                                title: true,
                                slug: true
                            }
                        }
                    }
                }
            }
        });
        // Transform the articles data to flatten the categories structure
        const articles = articlesRaw.map(article => ({
            ...article,
            categories: article.categories.map(cat => cat.category)
        }));
        res.json(articles);
    }
    catch (error) {
        console.error('Erro ao buscar artigos:', error);
        res.status(500).json({ error: 'Erro ao buscar artigos' });
    }
});
router.get('/:slug', async (req, res) => {
    const { slug } = req.params;
    try {
        const articleRaw = await prisma.article.findUnique({
            where: { slug },
            select: {
                id: true,
                title: true,
                slug: true,
                date: true,
                image: true,
                have_image: true,
                content: true,
                author: true,
                categories: {
                    select: {
                        category: {
                            select: {
                                id: true,
                                title: true,
                                slug: true
                            }
                        }
                    }
                }
            }
        });
        if (!articleRaw) {
            res.status(404).json({ error: 'Artigo não encontrado' });
            return;
        }
        // Transform the article data to flatten the categories structure
        const article = {
            ...articleRaw,
            categories: articleRaw.categories.map(cat => cat.category)
        };
        res.json(article);
    }
    catch (error) {
        console.error('Erro ao buscar artigo:', error);
        res.status(500).json({ error: 'Erro ao buscar artigo' });
    }
});
exports.default = router;

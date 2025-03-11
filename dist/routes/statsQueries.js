"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createArticleStat = exports.getArticleStats = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Função para buscar estatísticas do artigo
const getArticleStats = async (articleSlug) => {
    const stats = await prisma.articleStat.findMany({
        where: { article_slug: articleSlug },
    });
    const formattedStats = stats.reduce((acc, stat) => {
        const key = stat.stat || 'visit';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});
    return formattedStats;
};
exports.getArticleStats = getArticleStats;
// Função para criar uma nova interação de estatística de artigo
const createArticleStat = async (articleSlug, stat) => {
    await prisma.$executeRaw `
    CALL public_stats.create_article_stat(${articleSlug}, ${stat})
  `;
};
exports.createArticleStat = createArticleStat;

import { PrismaClient, ArticleStat } from '@prisma/client';

const prisma = new PrismaClient();

// Função para buscar estatísticas do artigo
export const getArticleStats = async (articleSlug: string) => {
  const stats = await prisma.articleStat.findMany({
    where: { article_slug: articleSlug },
  });

  const formattedStats = stats.reduce<{ [key: string]: number }>(
    (acc: { [key: string]: number }, stat: ArticleStat) => {
      const key = stat.stat || 'visit';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, 
    {}
  );

  return formattedStats;
};

// Função para criar uma nova interação de estatística de artigo
export const createArticleStat = async (articleSlug: string, stat: string) => {
  await prisma.$executeRaw`
    CALL public_stats.create_article_stat(${articleSlug}, ${stat})
  `;
};

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create sample lots - Games
  const gameLots = [
    {
      title: 'The Witcher 3: Wild Hunt',
      category: 'games',
      description: 'Эпическое RPG-приключение в мире ведьмака',
      imageUrl: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'RPG', year: 2015, rating: 9.3 })
    },
    {
      title: 'Cyberpunk 2077',
      category: 'games',
      description: 'Футуристическое киберпанк-приключение',
      imageUrl: 'https://images.pexels.com/photos/7915437/pexels-photo-7915437.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Action RPG', year: 2020, rating: 7.8 })
    },
    {
      title: 'Red Dead Redemption 2',
      category: 'games',
      description: 'Эпический вестерн с открытым миром',
      imageUrl: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Action Adventure', year: 2018, rating: 9.7 })
    },
    {
      title: 'God of War (2018)',
      category: 'games',
      description: 'Перерождение легендарной серии',
      imageUrl: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Action Adventure', year: 2018, rating: 9.5 })
    },
    {
      title: 'Spider-Man: Miles Morales',
      category: 'games',
      description: 'Новый человек-паук в действии',
      imageUrl: 'https://images.pexels.com/photos/3945657/pexels-photo-3945657.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Action Adventure', year: 2020, rating: 8.5 })
    },
    {
      title: 'The Last of Us Part II',
      category: 'games',
      description: 'Продолжение постапокалиптической драмы',
      imageUrl: 'https://images.pexels.com/photos/275033/pexels-photo-275033.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Action Adventure', year: 2020, rating: 9.2 })
    },
    {
      title: 'Ghost of Tsushima',
      category: 'games',
      description: 'Самурайское приключение в феодальной Японии',
      imageUrl: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Action Adventure', year: 2020, rating: 9.0 })
    },
    {
      title: 'Horizon Zero Dawn',
      category: 'games',
      description: 'Постапокалиптический мир с роботами-динозаврами',
      imageUrl: 'https://images.pexels.com/photos/2047905/pexels-photo-2047905.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Action RPG', year: 2017, rating: 8.9 })
    },
    {
      title: 'Minecraft',
      category: 'games',
      description: 'Бесконечный мир блоков и творчества',
      imageUrl: 'https://images.pexels.com/photos/1040160/pexels-photo-1040160.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Sandbox', year: 2011, rating: 9.0 })
    },
    {
      title: 'Among Us',
      category: 'games',
      description: 'Социальная игра на выживание в космосе',
      imageUrl: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Party Game', year: 2018, rating: 7.5 })
    },
    {
      title: 'Fall Guys',
      category: 'games',
      description: 'Веселая королевская битва с препятствиями',
      imageUrl: 'https://images.pexels.com/photos/3945657/pexels-photo-3945657.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Party Game', year: 2020, rating: 7.8 })
    },
    {
      title: 'Valorant',
      category: 'games',
      description: 'Тактический командный шутер',
      imageUrl: 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'FPS', year: 2020, rating: 8.2 })
    },
    {
      title: 'Genshin Impact',
      category: 'games',
      description: 'Anime-стилизованная RPG с открытым миром',
      imageUrl: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Action RPG', year: 2020, rating: 8.1 })
    },
    {
      title: 'Fortnite',
      category: 'games',
      description: 'Популярная королевская битва',
      imageUrl: 'https://images.pexels.com/photos/275033/pexels-photo-275033.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Battle Royale', year: 2017, rating: 7.9 })
    },
    {
      title: 'League of Legends',
      category: 'games',
      description: 'Легендарная MOBA игра',
      imageUrl: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'MOBA', year: 2009, rating: 8.4 })
    },
    {
      title: 'Counter-Strike: Global Offensive',
      category: 'games',
      description: 'Классический командный тактический шутер',
      imageUrl: 'https://images.pexels.com/photos/2047905/pexels-photo-2047905.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'FPS', year: 2012, rating: 8.6 })
    },
    {
      title: 'Overwatch 2',
      category: 'games',
      description: 'Командный герой-шутер от Blizzard',
      imageUrl: 'https://images.pexels.com/photos/1040160/pexels-photo-1040160.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Hero Shooter', year: 2022, rating: 7.3 })
    },
    {
      title: 'World of Warcraft',
      category: 'games',
      description: 'Легендарная MMORPG от Blizzard',
      imageUrl: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'MMORPG', year: 2004, rating: 8.8 })
    },
    {
      title: 'Elden Ring',
      category: 'games',
      description: 'Новейшее творение FromSoftware',
      imageUrl: 'https://images.pexels.com/photos/7915437/pexels-photo-7915437.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Action RPG', year: 2022, rating: 9.6 })
    },
    {
      title: 'FIFA 23',
      category: 'games',
      description: 'Последний футбольный симулятор EA Sports',
      imageUrl: 'https://images.pexels.com/photos/3945657/pexels-photo-3945657.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Sports', year: 2022, rating: 7.5 })
    }
  ]

  // Create sample lots - Movies and Series
  const movieLots = [
    {
      title: 'Мстители: Финал',
      category: 'movies',
      description: 'Эпическое завершение саги о Мстителях',
      imageUrl: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Superhero', year: 2019, rating: 8.4, type: 'movie' })
    },
    {
      title: 'Игра престолов',
      category: 'movies',
      description: 'Эпическая фэнтези-сага о борьбе за власть',
      imageUrl: 'https://images.pexels.com/photos/1117132/pexels-photo-1117132.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Fantasy', year: 2011, rating: 9.3, type: 'series' })
    },
    {
      title: 'Очень странные дела',
      category: 'movies',
      description: 'Сверхъестественные приключения в 80-х',
      imageUrl: 'https://images.pexels.com/photos/1000445/pexels-photo-1000445.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Sci-Fi Horror', year: 2016, rating: 8.7, type: 'series' })
    },
    {
      title: 'Интерстеллар',
      category: 'movies',
      description: 'Космическая одиссея о спасении человечества',
      imageUrl: 'https://images.pexels.com/photos/586063/pexels-photo-586063.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Sci-Fi', year: 2014, rating: 8.6, type: 'movie' })
    },
    {
      title: 'Тёмный рыцарь',
      category: 'movies',
      description: 'Лучший фильм о Бэтмене от Кристофера Нолана',
      imageUrl: 'https://images.pexels.com/photos/1181715/pexels-photo-1181715.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Superhero', year: 2008, rating: 9.0, type: 'movie' })
    },
    {
      title: 'Во все тяжкие',
      category: 'movies',
      description: 'Драма о школьном учителе химии',
      imageUrl: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Crime Drama', year: 2008, rating: 9.5, type: 'series' })
    },
    {
      title: 'Мандалорец',
      category: 'movies',
      description: 'Приключения наёмника в галактике далеко-далеко',
      imageUrl: 'https://images.pexels.com/photos/1117132/pexels-photo-1117132.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Sci-Fi Adventure', year: 2019, rating: 8.8, type: 'series' })
    },
    {
      title: 'Паразиты',
      category: 'movies',
      description: 'Корейская социальная драма-триллер',
      imageUrl: 'https://images.pexels.com/photos/1000445/pexels-photo-1000445.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Thriller', year: 2019, rating: 8.6, type: 'movie' })
    },
    {
      title: 'Джокер',
      category: 'movies',
      description: 'Психологическая драма о происхождении злодея',
      imageUrl: 'https://images.pexels.com/photos/586063/pexels-photo-586063.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Psychological Thriller', year: 2019, rating: 8.4, type: 'movie' })
    },
    {
      title: 'Ведьмак',
      category: 'movies',
      description: 'Фэнтези-сериал о ведьмаке Геральте',
      imageUrl: 'https://images.pexels.com/photos/1181715/pexels-photo-1181715.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Fantasy', year: 2019, rating: 8.2, type: 'series' })
    },
    {
      title: 'Дом дракона',
      category: 'movies',
      description: 'Приквел к Игре престолов о доме Таргариенов',
      imageUrl: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Fantasy', year: 2022, rating: 8.5, type: 'series' })
    },
    {
      title: 'Начало',
      category: 'movies',
      description: 'Фантастический триллер о сновидениях',
      imageUrl: 'https://images.pexels.com/photos/1117132/pexels-photo-1117132.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Sci-Fi Thriller', year: 2010, rating: 8.8, type: 'movie' })
    },
    {
      title: 'Матрица',
      category: 'movies',
      description: 'Революционный киберпанк-боевик',
      imageUrl: 'https://images.pexels.com/photos/1000445/pexels-photo-1000445.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Sci-Fi Action', year: 1999, rating: 8.7, type: 'movie' })
    },
    {
      title: 'Отряд самоубийц',
      category: 'movies',
      description: 'Команда суперзлодеев на секретном задании',
      imageUrl: 'https://images.pexels.com/photos/586063/pexels-photo-586063.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Superhero Action', year: 2016, rating: 6.0, type: 'movie' })
    },
    {
      title: 'Чернобыль',
      category: 'movies',
      description: 'Историческая драма о катастрофе на ЧАЭС',
      imageUrl: 'https://images.pexels.com/photos/1181715/pexels-photo-1181715.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Historical Drama', year: 2019, rating: 9.4, type: 'miniseries' })
    },
    {
      title: 'Пацаны',
      category: 'movies',
      description: 'Тёмная сатира на супергероев',
      imageUrl: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Superhero Satire', year: 2019, rating: 8.7, type: 'series' })
    },
    {
      title: 'Марвел\'с Локи',
      category: 'movies',
      description: 'Приключения бога обмана во времени',
      imageUrl: 'https://images.pexels.com/photos/1117132/pexels-photo-1117132.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Superhero Sci-Fi', year: 2021, rating: 8.2, type: 'series' })
    },
    {
      title: 'Дюна',
      category: 'movies',
      description: 'Эпическая научно-фантастическая сага',
      imageUrl: 'https://images.pexels.com/photos/1000445/pexels-photo-1000445.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Sci-Fi Epic', year: 2021, rating: 8.0, type: 'movie' })
    },
    {
      title: 'Человек-паук: Нет пути домой',
      category: 'movies',
      description: 'Мультивселенная Человека-паука',
      imageUrl: 'https://images.pexels.com/photos/586063/pexels-photo-586063.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Superhero', year: 2021, rating: 8.4, type: 'movie' })
    },
    {
      title: 'Топ Ган: Мэверик',
      category: 'movies',
      description: 'Продолжение классического боевика о пилотах',
      imageUrl: 'https://images.pexels.com/photos/1181715/pexels-photo-1181715.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      meta: JSON.stringify({ genre: 'Action', year: 2022, rating: 8.3, type: 'movie' })
    }
  ]

  // Insert lots
  for (const lot of gameLots) {
    await prisma.lot.create({ data: lot })
  }

  for (const lot of movieLots) {
    await prisma.lot.create({ data: lot })
  }

  // Create archived auction example
  const auction = await prisma.auction.create({
    data: {
      mode: 'cards',
      durationSec: 60,
      status: 'archived',
      startedAt: new Date(Date.now() - 3600000), // 1 hour ago
      finishedAt: new Date(Date.now() - 3000000), // 50 minutes ago
      createdAt: new Date(Date.now() - 7200000), // 2 hours ago
    }
  })

  // Add some lots to archived auction
  const sampleLots = await prisma.lot.findMany({ take: 5 })
  for (let i = 0; i < sampleLots.length; i++) {
    await prisma.auctionLot.create({
      data: {
        auctionId: auction.id,
        lotId: sampleLots[i].id,
        order: i + 1
      }
    })
  }

  // Add history records
  const historyEvents = [
    { eventType: 'auction_configured', payload: JSON.stringify({ mode: 'cards', duration: 60, lotsCount: 5 }) },
    { eventType: 'auction_started', payload: JSON.stringify({ startedAt: auction.startedAt }) },
    { eventType: 'lot_displayed', payload: JSON.stringify({ lotId: sampleLots[0].id, title: sampleLots[0].title }) },
    { eventType: 'lot_displayed', payload: JSON.stringify({ lotId: sampleLots[1].id, title: sampleLots[1].title }) },
    { eventType: 'auction_paused', payload: JSON.stringify({ pausedAt: new Date(Date.now() - 3300000) }) },
    { eventType: 'auction_resumed', payload: JSON.stringify({ resumedAt: new Date(Date.now() - 3200000) }) },
    { eventType: 'lot_displayed', payload: JSON.stringify({ lotId: sampleLots[2].id, title: sampleLots[2].title }) },
    { eventType: 'auction_finished', payload: JSON.stringify({ finishedAt: auction.finishedAt, totalLots: 5 }) }
  ]

  for (const event of historyEvents) {
    await prisma.historyRecord.create({
      data: {
        auctionId: auction.id,
        ...event
      }
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
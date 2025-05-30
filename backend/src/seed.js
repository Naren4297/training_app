// seed.js
const db = require('./config/db.config');

const seedDatabase = async () => {
  await db.sequelize.sync({ force: false }); // This will drop and recreate the tables

  await db.trainingTrackers.create({
    name: 'React Basics',
    topic: 'React Basics',
    subtopic: 'Hooks',
    status: 'Ongoing',
    date: new Date(),
    createdBy: 'admin'
  });

  await db.trainingTrackers.create({
    name: 'Advanced JavaScript',
    topic: 'Advanced JavaScript',
    subtopic: 'ES6+',
    status: 'Ongoing',
    date: new Date(),
    createdBy: 'admin'
  });

  console.log('Database seeded!');
};

seedDatabase().catch(err => {
  console.error('Failed to seed database:', err);
});
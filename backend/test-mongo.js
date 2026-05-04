const { MongoMemoryServer } = require('mongodb-memory-server');
async function run() {
  const mongoServer = await MongoMemoryServer.create({
    instance: {
      dbPath: __dirname + '/local-db-data',
      storageEngine: 'wiredTiger'
    }
  });
  console.log("URI:", mongoServer.getUri());
  await mongoServer.stop();
}
run().catch(console.error);

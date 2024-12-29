import { MongoClient, Db, Collection } from 'mongodb';
import { User } from '~/modules/user/model';
import appConfig from './config';

const uri = `mongodb+srv://${appConfig.db.mongodbUser}:${appConfig.db.mongodbPassword}@clustersing.072ry7k.mongodb.net/?retryWrites=true&w=majority`;

class MongoDatabaseService {
  private client: MongoClient;
  private db: Db;

  constructor() {
    this.client = new MongoClient(uri);
    this.db = this.client.db(appConfig.db.mongodbName);
  }

  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 });
      console.log('Pinged your deployment. You successfully connected to MongoDB!');
    } catch (err) {
      console.dir(err);
      await this.close();
      throw err;
    } finally {
      // Ensures that the client will close when you finish/error
    }
  }

  async close() {
    console.log('Disconnecting MongoDB!');
    await this.client.close();
    console.log('MongoDB disconnected');
  }

  get users(): Collection<User> {
    return this.db.collection('users');
  }
  // get transactions(): Collection<Transaction> {
  //   return this.db.collection("transactions");
  // }

  // get categories(): Collection<Category> {
  //   return this.db.collection("categories");
  // }

  get refreshTokens(): Collection<{ token: string }> {
    return this.db.collection('refresh_tokens');
  }
}

const mongodbService = new MongoDatabaseService();

export default mongodbService;

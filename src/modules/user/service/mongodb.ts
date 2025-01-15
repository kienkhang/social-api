import { Paging, Paginated, UserRole, TokenType } from '~/shared/interface';
import { IUserRepository } from '../interface';
import { IUpdateUserForm, IUserCondForm, User } from '../model';
import mongodbService from '~/shared/common/mongodb';
import { ObjectId } from 'mongodb';
import jwt from '~/shared/common/jwt';
import appConfig from '~/shared/common/config';

export class MongodbUserRepository implements IUserRepository {
  async generateToken({
    userId,
    type,
    role = UserRole.ENTERPRISE,
    expiresIn,
  }: {
    userId: string;
    type: TokenType;
    role?: UserRole;
    expiresIn?: string;
  }): Promise<string> {
    return jwt.generateToken({
      payload: { sub: userId, role, type },
      options: { expiresIn: expiresIn ?? appConfig.jwt.accessTokenExpiresIn },
    });
  }

  async findById(id: string): Promise<User | null> {
    const user = await mongodbService.users.findOne({ _id: new ObjectId(id) });
    return user;
  }

  async findByCond(cond: IUserCondForm): Promise<User | null> {
    const user = await mongodbService.users.findOne(cond);
    return user;
  }

  async insert(user: User): Promise<User> {
    const result = await mongodbService.users.insertOne(user);
    const found = await mongodbService.users.findOne({ _id: result.insertedId });
    return found as User;
  }
  async list(cond: IUserCondForm, paging: Paging): Promise<Paginated<User>> {
    const offset = (paging.page - 1) * paging.limit;
    const cursor = mongodbService.users.find(cond);

    const count = (await cursor.clone().toArray()).length;

    const result = await cursor.clone().skip(offset).limit(paging.limit).toArray();

    return {
      entries: result,
      metadata: {
        ...paging,
        total: count,
        hasNext: result.length >= paging.limit,
      },
    };
  }
  async update(id: string, form: IUpdateUserForm): Promise<boolean> {
    const result = await mongodbService.users.updateOne(
      {
        _id: new ObjectId(id),
      },
      { $set: form },
    );
    return !!result.modifiedCount;
  }
}

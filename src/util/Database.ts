import {
  connect,
  Collection,
  UpdateOneOptions,
  UpdateWriteOpResult,
  InsertOneWriteOpResult,
  CollectionInsertOneOptions,
  DeleteWriteOpResultObject,
  ReplaceOneOptions,
  ReplaceWriteOpResult,
  ClientSession,
  MongoCountPreferences,
  Db,
  MongoClient
} from "mongodb";
import { Snowflake } from "discord.js";
import { DatabaseOptions } from '@types'

export class Database {
  db?: Db;

  constructor (private config: DatabaseOptions) {
  }

  /**
   * Connect to the database
   * @return {Promise<void>}
   */
  async connect (): Promise<void> {
    const mongo = await connect(this.config.url, this.config.clientOptions)
      .catch((err) => {
        console.error(err);
      });
    if (mongo instanceof MongoClient) {
      this.db = mongo.db(this.config.name);
    }
  }

  /**
   * Insert a document
   * @param {CollectionName} collection
   * @param data
   * @param {CollectionInsertOneOptions} options
   * @returns {Promise<InsertOneWriteOpResult<any>>}
   */
  async insert (collection: CollectionName, data: any, options?: CollectionInsertOneOptions): Promise<InsertOneWriteOpResult<any>> {
    return this.db.collection(collection).insertOne(data, options);
  }

  /**
   * Update a document
   * @param {CollectionName} collection
   * @param query
   * @param data
   * @param {UpdateOneOptions} options
   * @returns {Promise<UpdateWriteOpResult>}
   */
  async update (collection: CollectionName, query: any, data: any, options?: UpdateOneOptions): Promise<UpdateWriteOpResult> {
    return this.db.collection(collection).updateOne(query, { $set: data }, options);
  }

  /**
   * Update a document *Note: must include operators!*
   * @param {CollectionName} collection
   * @param query
   * @param data
   * @param {UpdateOneOptions} options
   * @returns {Promise<UpdateWriteOpResult>}
   * @example
   * updateRaw("guilds", { id: "1234" }, { $set: { prefix: "!!" } })
   */
  async updateRaw (collection: CollectionName, query: any, data: any, options?: UpdateOneOptions): Promise<UpdateWriteOpResult> {
    return this.db.collection(collection).updateOne(query, data, options);
  }

  /**
   * Replace a document
   * @param {CollectionName} collection
   * @param filter
   * @param data
   * @param {ReplaceOneOptions} options
   * @returns {Promise<ReplaceWriteOpResult>}
   */
  async replace (collection: CollectionName, filter: any, data: any, options?: ReplaceOneOptions): Promise<ReplaceWriteOpResult> {
    return this.db.collection(collection).replaceOne(filter, data, options);
  }

  /**
   * Delete a document
   * @param {CollectionName} collection
   * @param query
   * @returns {Promise<DeleteWriteOpResultObject>}
   */
  async delete (collection: CollectionName, query: any): Promise<DeleteWriteOpResultObject> {
    return this.db.collection(collection).deleteOne(query);
  }

  /**
   * Drop a collection
   * @param {CollectionName} collection
   * @param {ClientSession} options
   * @returns {Promise<boolean>}
   */
  async drop (collection: CollectionName, options?: ClientSession): Promise<boolean> {
    return this.db.collection(collection).drop((options as any));
  }

  /**
   * Find a document
   * @param {CollectionName} collection
   * @param query
   * @returns {Promise<any | null>}
   */
  async find (collection: CollectionName, query: any): Promise<any | null> {
    return this.db.collection(collection).findOne(query);
  }

  /**
   * Count the number of documents in a collection
   * @param {CollectionName} collection
   * @param query
   * @param options
   * @returns {Promise<number>}
   */
  async count (collection: CollectionName, query?: any, options?: MongoCountPreferences): Promise<number> {
    return this.db.collection(collection).countDocuments(query, options);
  }

  /**
   * Find many matching documents
   * @param {CollectionName} collection
   * @param query
   * @returns {Promise<any[]>}
   */
  async findMany (collection: CollectionName, query: any): Promise<any[]> {
    return this.db.collection(collection).find(query).toArray();
  }

  /**
   * Find a document in a collection by it's id
   * @param {CollectionName} collection
   * @param {Snowflake} id
   * @returns Promise<any>
   */
  async findOneById (collection: CollectionName, id: Snowflake) {
    return this.db.collection(collection).findOne({ id: id });
  }

  /**
   * Get the guilds collection
   * @deprecated
   * @example
   * Client.db.guilds.findOne({ id: 123 })
   * @returns {Collection<GuildDB>} - The guild's settings document
   */
  get guilds () {
    return this.db.collection("guilds");
  }

  /**
   * Get the users collection
   * @deprecated
   * @return {Collection}
   */
  get users () {
    return this.db.collection("users");
  }
}

type CollectionName = "users" | "guilds" | string;

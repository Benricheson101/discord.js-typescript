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
} from 'mongodb'
import { Snowflake } from 'discord.js'
import { DatabaseOptions, GuildDocument } from '@types'
import * as chalk from 'chalk'

export class Database {
  public db?: Db;
  mongoClient?: MongoClient

  constructor (private readonly config: DatabaseOptions) {
    this.connect()
      .then(() => console.log(chalk`{blue [{bold D}] {bold Connected} to MongoDB}`))
      .catch(console.error)
  }

  /**
   * Connect to the database
   * @return {Promise<void>}
   */
  async connect (): Promise<void> {
    const mongo = await connect(this.config.url, this.config.options)
      .catch((err) => {
        console.error(err)
      })
    if (mongo instanceof MongoClient) {
      this.db = mongo.db(this.config.name)
      this.mongoClient = mongo
    }
  }

  /**
   * Close the MongoDB connection
   */
  async close (): Promise<void> {
    if (!this.db || !this.mongoClient) throw new Error('NO RUNNING DB')
    return await this.mongoClient.close()
  }

  /**
   * Insert a document
   * @param {CollectionName} collection
   * @param data
   * @param {CollectionInsertOneOptions} options
   * @returns {Promise<InsertOneWriteOpResult<any>>}
   */
  async insert (collection: CollectionName, data: any, options?: CollectionInsertOneOptions): Promise<InsertOneWriteOpResult<any>> {
    return await this.db.collection(collection).insertOne(data, options)
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
    return await this.db.collection(collection).updateOne(query, { $set: data }, options)
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
    return await this.db.collection(collection).updateOne(query, data, options)
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
    return await this.db.collection(collection).replaceOne(filter, data, options)
  }

  /**
   * Delete a document
   * @param {CollectionName} collection
   * @param query
   * @returns {Promise<DeleteWriteOpResultObject>}
   */
  async delete (collection: CollectionName, query: any): Promise<DeleteWriteOpResultObject> {
    return await this.db.collection(collection).deleteOne(query)
  }

  /**
   * Drop a collection
   * @param {CollectionName} collection
   * @param {ClientSession} options
   * @returns {Promise<boolean>}
   */
  async drop (collection: CollectionName, options?: ClientSession): Promise<boolean> {
    return await this.db.collection(collection).drop((options as any))
  }

  /**
   * Find a document
   * @param {CollectionName} collection
   * @param query
   * @returns {Promise<any | null>}
   */
  async find (collection: CollectionName, query: any): Promise<any | null> {
    return await this.db.collection(collection).findOne(query)
  }

  /**
   * Count the number of documents in a collection
   * @param {CollectionName} collection
   * @param query
   * @param options
   * @returns {Promise<number>}
   */
  async count (collection: CollectionName, query?: any, options?: MongoCountPreferences): Promise<number> {
    return await this.db.collection(collection).countDocuments(query, options)
  }

  /**
   * Find many matching documents
   * @param {CollectionName} collection
   * @param query
   * @returns {Promise<any[]>}
   */
  async findMany (collection: CollectionName, query: any): Promise<any[]> {
    return await this.db.collection(collection).find(query).toArray()
  }

  /**
   * Find a document in a collection by it's id
   * @param {CollectionName} collection
   * @param {Snowflake} id
   * @returns Promise<any>
   */
  async findOneById (collection: CollectionName, id: Snowflake): Promise<any> {
    return await this.db.collection(collection).findOne({ id: id })
  }

  /**
   * Get the guilds collection
   * @deprecated
   * @example
   * Client.db.guilds.findOne({ id: 123 })
   * @returns {Collection<GuildDocument>} - The guild's settings document
   */
  get guilds (): Collection<GuildDocument> {
    return this.db.collection('guilds')
  }

  /**
   * Get the users collection
   * @deprecated
   * @return {Collection}
   */
  get users (): Collection<any> {
    return this.db.collection('users')
  }

  async getGuild (id: Snowflake): Promise<GuildDocument> {
    return await this.find('guilds', { id: id })
  }

  async updateGuild (id: Snowflake, data: any): Promise<UpdateWriteOpResult> {
    return await this.update('guilds', { id: id }, { $set: data })
  }
}

type CollectionName = 'users' | 'guilds' | string;

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Database from 'better-sqlite3';
import * as path from 'path';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private db: any;
  private readonly dbPath: string;

  constructor() {
    // 从环境变量获取数据库路径，默认为 ../data/stocks.db
    this.dbPath = process.env.DB_DATABASE || path.join(__dirname, '..', '..', 'data', 'stocks.db');
  }

  async onModuleInit() {
    try {
      // 打开数据库连接
      this.db = new Database(this.dbPath, {
        verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
        fileMustExist: false, // 如果数据库文件不存在，会自动创建
      });

      // 启用外键约束
      this.db.pragma('foreign_keys = ON');

      // 启用WAL模式以提高并发性能
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('synchronous = NORMAL');

      console.log(`Better-sqlite3数据库连接成功: ${this.dbPath}`);
    } catch (error) {
      console.error('Better-sqlite3数据库连接失败:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.db) {
      this.db.close();
      console.log('Better-sqlite3数据库连接已关闭');
    }
  }

  /**
   * 获取数据库实例
   */
  getDatabase(): any {
    if (!this.db) {
      throw new Error('数据库未初始化');
    }
    return this.db;
  }

  /**
   * 执行查询并返回所有结果
   */
  query<T = any>(sql: string, params: any[] = []): T[] {
    const stmt = this.db.prepare(sql);
    return stmt.all(...params) as T[];
  }

  /**
   * 执行查询并返回第一条结果
   */
  queryOne<T = any>(sql: string, params: any[] = []): T | null {
    const stmt = this.db.prepare(sql);
    return stmt.get(...params) as T | null;
  }

  /**
   * 执行更新/插入/删除操作
   */
  execute(sql: string, params: any[] = []): any {
    const stmt = this.db.prepare(sql);
    return stmt.run(...params);
  }

  /**
   * 开始事务
   */
  beginTransaction(): any {
    return this.db.transaction((...args) => {
      // 事务函数
    });
  }

  /**
   * 执行批量插入
   */
  batchInsert<T extends Record<string, any>>(table: string, data: T[]): void {
    if (data.length === 0) return;

    const columns = Object.keys(data[0]);
    const placeholders = columns.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
    
    const insert = this.db.prepare(sql);
    const transaction = this.db.transaction((items: T[]) => {
      for (const item of items) {
        const values = columns.map(col => item[col]);
        insert.run(...values);
      }
    });

    transaction(data);
  }

  /**
   * 检查表是否存在
   */
  tableExists(tableName: string): boolean {
    const result = this.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name=?`,
      [tableName]
    );
    return result?.count === 1;
  }

  /**
   * 获取表结构信息
   */
  getTableSchema(tableName: string): any[] {
    return this.query(`PRAGMA table_info(${tableName})`);
  }

  /**
   * 备份数据库到指定路径
   */
  backup(backupPath: string): void {
    const backupDb = new Database(backupPath);
    this.db.backup(backupDb, {
      progress: ({ totalPages, remainingPages }) => {
        const percentage = ((totalPages - remainingPages) / totalPages * 100).toFixed(1);
        console.log(`数据库备份进度: ${percentage}%`);
      }
    });
    backupDb.close();
  }
}
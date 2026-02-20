import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StockDayPepbData } from './entities/stock-day-pepb-data.entity';
import { StockBonusData } from './entities/stock-bonus-data.entity';
import { Portfolio } from './entities/portfolio.entity';
import { StockController } from './controllers/stock.controller';
import { PortfolioController } from './controllers/portfolio.controller';
import { StockService } from './services/stock.service';
import { PortfolioService } from './services/portfolio.service';
import { DatabaseService } from './database.service';
import { SqliteQueryService } from './services/sqlite-query.service';
import { StockBetterService } from './services/stock-better.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DB_DATABASE || '../data/stocks.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production', // 开发环境自动同步，生产环境设为false
      logging: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature([StockDayPepbData, StockBonusData, Portfolio]),
  ],
  controllers: [AppController, StockController, PortfolioController],
  providers: [AppService, StockService, PortfolioService, DatabaseService, SqliteQueryService, StockBetterService],
})
export class AppModule {}

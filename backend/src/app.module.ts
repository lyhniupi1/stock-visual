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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: '../data/stocks.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // 开发环境自动同步，生产环境设为false
      logging: true,
    }),
    TypeOrmModule.forFeature([StockDayPepbData, StockBonusData, Portfolio]),
  ],
  controllers: [AppController, StockController, PortfolioController],
  providers: [AppService, StockService, PortfolioService],
})
export class AppModule {}

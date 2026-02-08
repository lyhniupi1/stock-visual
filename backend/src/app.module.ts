import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StockDayPepbData } from './entities/stock-day-pepb-data.entity';
import { StockController } from './controllers/stock.controller';
import { StockService } from './services/stock.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: '../data/stocks.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // 生产环境设为false，使用迁移
      logging: true,
    }),
    TypeOrmModule.forFeature([StockDayPepbData]),
  ],
  controllers: [AppController, StockController],
  providers: [AppService, StockService],
})
export class AppModule {}

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { PortfolioService } from '../services/portfolio.service';
import { Portfolio, PortfolioStock } from '../entities/portfolio.entity';

interface CreatePortfolioDto {
  name: string;
  stocks: PortfolioStock[];
  createdAt: string;
}

interface UpdatePortfolioDto {
  name?: string;
  stocks?: PortfolioStock[];
}

interface PortfolioResponse {
  id: number;
  name: string;
  stockCount: number;
  stocks: PortfolioStock[];
  createdAt: string;
  initialValue: number;
  currentValue: number;
  profitPercent: number;
}

@Controller('api/portfolios')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  async findAll(): Promise<PortfolioResponse[]> {
    const portfolios = await this.portfolioService.findAll();
    return portfolios.map((p) => this.toResponse(p));
  }

  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PortfolioResponse> {
    const portfolio = await this.portfolioService.findById(id);
    return this.toResponse(portfolio);
  }

  @Post()
  async create(@Body() dto: CreatePortfolioDto): Promise<PortfolioResponse> {
    const portfolio = await this.portfolioService.create(
      dto.name,
      dto.stocks || [],
      dto.createdAt,
    );
    return this.toResponse(portfolio);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePortfolioDto,
  ): Promise<PortfolioResponse> {
    const portfolio = await this.portfolioService.update(
      id,
      dto.name,
      dto.stocks,
    );
    return this.toResponse(portfolio);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    await this.portfolioService.delete(id);
    return { success: true };
  }

  private toResponse(portfolio: Portfolio): PortfolioResponse {
    return {
      id: portfolio.id,
      name: portfolio.name,
      stockCount: portfolio.stockCount,
      stocks: portfolio.getStockList(),
      createdAt: portfolio.createdAt,
      initialValue: portfolio.initialValue,
      currentValue: portfolio.currentValue || portfolio.initialValue,
      profitPercent: portfolio.getProfitPercent(),
    };
  }
}

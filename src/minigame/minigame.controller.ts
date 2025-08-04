import { Body, Controller, Post, Req, UseGuards, Get } from '@nestjs/common';
import { MinigameService } from './minigame.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { SubmitScoreDto } from './dto/submit-score.dto';
import { TicketEarningType } from './ticket-earning-log.entity';
import { ApiBody, ApiTags, ApiOperation } from '@nestjs/swagger';


@ApiTags('Minigame')
@Controller('minigame')
export class MinigameController {
  constructor(private readonly minigameService: MinigameService) { }


  @Post('submit-score')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Submit a minigame score and consume a ticket' })
  @ApiBody({
    type: SubmitScoreDto,
    examples: {
      default: {
        summary: 'Submit score',
        value: { score: 150 },
      },
    },
  })
  async submitScore(@Req() req, @Body() dto: SubmitScoreDto) {
    const userId = req.user.id;
    return this.minigameService.submitScore(userId, dto.score);
  }

  @Post('earn-ticket')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Earn a minigame ticket by action' })
  @ApiBody({
    schema: {
      example: {
        type: 'post', // or 'product', 'social'
        refId: '123', // optional, e.g., postId or productId
      },
    },
    description: 'Type: post, product, or social. refId is optional.',
  })
  async earnTicket(@Req() req, @Body() body: { type: TicketEarningType, refId?: string }) {
    const userId = req.user.id;
    return this.minigameService.addTicket(userId, body.type, body.refId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('play-scratch')
  @ApiOperation({ summary: 'Play the scratch minigame (consumes a ticket)' })
  async playScratch(@Req() req) {
    const userId = req.user.id;
    return this.minigameService.playScratch(userId);
  }

  @Post('play-scratch/start')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Start a scratch game (deducts a ticket, returns gameId)' })
  async startScratch(@Req() req) {
    const userId = req.user.id;
    return this.minigameService.startScratch(userId);
  }

  @Post('play-scratch/reveal')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Reveal scratch result (returns grid and rewards)' })
  @ApiBody({ schema: { example: { gameId: '...' } } })
  async revealScratch(@Req() req, @Body() body: { gameId: string }) {
    const userId = req.user.id;
    return this.minigameService.revealScratch(userId, body.gameId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('claim-daily-ticket')
  @ApiOperation({ summary: 'Claim your daily free minigame ticket' })
  async claimDailyTicket(@Req() req) {
    const userId = req.user.id;
    return this.minigameService.claimDailyFreeTicket(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('ticket-count')
  @ApiOperation({ summary: 'Get current user minigame ticket count' })
  async getTicketCount(@Req() req) {
    const userId = req.user.id;
    const tickets = await this.minigameService.getTicketCount(userId);
    return { tickets };
  }

  @UseGuards(JwtAuthGuard)
  @Get('user-points')
  async getUserPoints(@Req() req) {
    const userId = req.user.id;
    const userPoints = await this.minigameService.getUserPoints(userId);
    return { userPoints };
  }
}
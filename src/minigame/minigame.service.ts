import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from '../users/user.entity';
import { CouponsService } from '../coupons/coupons.service';
import { TicketEarningLog, TicketEarningType } from './ticket-earning-log.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { randomBytes } from 'crypto';
import { UserCoupon } from '../coupons/user-coupon.entity';
import { v4 as uuidv4 } from 'uuid';

type ScratchGameSession = {
  userId: number;
  reward: {
    type: 'points' | 'coupon' | 'none';
    value: number | string;
    message: string;
  };
  createdAt: Date;
};

@Injectable()
export class MinigameService {
  private readonly COUPON_POINT_THRESHOLD = 1000;
  private readonly MAX_TICKETS_PER_DAY = 3;
  private readonly SCRATCH_SYMBOLS = [
  'ssrb.png',
  'takodachi.png',
  'bubba.png',
  'bloop.png',      // <-- fix spelling to match frontend
  'greenssrb.png'
];
  private readonly SCRATCH_GRID_SIZE = 3;
  private scratchGames = new Map<string, ScratchGameSession>();

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(TicketEarningLog)
    private ticketEarningLogRepository: Repository<TicketEarningLog>,
    private couponsService: CouponsService,
    @InjectRepository(UserCoupon)
    private userCouponRepo: Repository<UserCoupon>,
    private notificationsService: NotificationsService,
  ) {}

  async submitScore(userId: number, score: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId }, relations: ['coupons'] });
    if (!user) throw new NotFoundException('User not found');
    if (user.minigame_tickets <= 0) {
      return { message: 'No tickets left.', tickets: user.minigame_tickets };
    }

    user.minigame_tickets -= 1;
    user.points += score;
    await this.usersRepository.save(user);

    // Coupon logic (unchanged)
    const activeCoupon = await this.couponsService.findActiveCoupon();
    const hasCoupon = activeCoupon
      ? await this.userCouponRepo.findOne({ where: { user: { id: userId }, coupon: { id: activeCoupon.id } } })
      : null;

    if (activeCoupon && user.points >= this.COUPON_POINT_THRESHOLD && !hasCoupon) {
      const redeemToken = randomBytes(32).toString('hex');
      const userCoupon = this.userCouponRepo.create({
        user,
        coupon: activeCoupon,
        redeemed: false,
        redeemToken,
      });
      await this.userCouponRepo.save(userCoupon);

      // Optionally notify user
      const redeemUrl = `https://pengoo.store/redeem-coupon?token=${redeemToken}`;
      await this.notificationsService.sendEmail(
        user.email,
        'Redeem your coupon!',
        `Congratulations! You earned a coupon. Click here to redeem: ${redeemUrl}`
      );

      return {
        message: `Congratulations! You earned a coupon. Check your email to redeem it.`,
        points: user.points,
        tickets: user.minigame_tickets,
        couponGranted: true,
        couponCode: activeCoupon.code,
      };
    }

    return { message: 'Score submitted', points: user.points, tickets: user.minigame_tickets };
  }

  async addTicket(userId: number, type: TicketEarningType, refId?: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Prevent duplicate for the same refId/type
    if (refId) {
      const existing = await this.ticketEarningLogRepository.findOne({
        where: { user: { id: userId }, type, refId },
      });
      if (existing) {
        return { message: 'Already earned a ticket for this action.', tickets: user.minigame_tickets };
      }
    }

    // Limit per day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const earnedToday = await this.ticketEarningLogRepository.count({
      where: {
        user: { id: userId },
        createdAt: Between(today, tomorrow),
      },
    });

    if (earnedToday >= this.MAX_TICKETS_PER_DAY) {
      return { message: 'Reached ticket earning limit for today.', tickets: user.minigame_tickets };
    }

    // Grant ticket and log the action
    user.minigame_tickets += 1;
    await this.usersRepository.save(user);

    const log = this.ticketEarningLogRepository.create({
      user,
      type,
      refId,
    });
    await this.ticketEarningLogRepository.save(log);

    return { message: 'Ticket earned!', tickets: user.minigame_tickets };
  }

  // --- SCRATCH GAME LOGIC ---
  async playScratch(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.minigame_tickets <= 0) {
      return { message: 'No tickets left.', tickets: user.minigame_tickets };
    }

    user.minigame_tickets -= 1;

    // Generate grid (random symbols)
    const grid: string[][] = [];
    for (let i = 0; i < this.SCRATCH_GRID_SIZE; i++) {
      grid[i] = [];
      for (let j = 0; j < this.SCRATCH_GRID_SIZE; j++) {
        const token = this.SCRATCH_SYMBOLS[Math.floor(Math.random() * this.SCRATCH_SYMBOLS.length)];
        grid[i][j] = token;
      }
    }

    // --- NEW: Calculate win lines and score ---
    const winLines = this.getWinLines(grid);
    const gridScore = winLines.length * 100;
    const bonus = winLines.length > 0 ? 50 * winLines.length : 0;
    const totalPoints = gridScore + bonus;
    let message = '';
    let couponGranted = false;
    let couponCode: string | null = null;

    if (winLines.length > 0) {
      message = `Chúc mừng! Bạn có ${winLines.length} hàng thắng và nhận được ${totalPoints} điểm!`;
    } else {
      message = "Không có hàng thắng nào. Chúc bạn may mắn lần sau!";
    }

    user.points += totalPoints;
    await this.usersRepository.save(user);

    // Coupon logic (unchanged)
    const activeCoupon = await this.couponsService.findActiveCoupon();
    if (activeCoupon && user.points >= this.COUPON_POINT_THRESHOLD) {
      const hasCoupon = await this.userCouponRepo.findOne({
        where: { user: { id: userId }, coupon: { id: activeCoupon.id } }
      });
      if (!hasCoupon) {
        const redeemToken = randomBytes(32).toString('hex');
        const userCoupon = this.userCouponRepo.create({
          user,
          coupon: activeCoupon,
          redeemed: false,
          redeemToken,
        });
        await this.userCouponRepo.save(userCoupon);
        couponGranted = true;
        couponCode = activeCoupon.code;
      }
    }

    // After generating the grid in playScratch
    console.log('Scratch grid:', grid);

    return {
      grid,
      winLines,
      gridScore,
      bonus,
      totalPoints,
      tickets: user.minigame_tickets,
      couponGranted,
      couponCode,
      message,
      userPoints: user.points, // <-- add this line
    };
  }
  // --- END SCRATCH GAME LOGIC ---

  async startScratch(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.minigame_tickets <= 0) {
      return { message: 'No tickets left.', tickets: user.minigame_tickets };
    }
    user.minigame_tickets -= 1;
    await this.usersRepository.save(user);

    // Generate a random reward (e.g. points or coupon)
    const rewards = [
      { type: 'points', value: 100, message: 'Bạn nhận được 100 điểm!' },
      { type: 'points', value: 200, message: 'Bạn nhận được 200 điểm!' },
      { type: 'coupon', value: 'SALE50', message: 'Bạn nhận được coupon SALE50!' },
      { type: 'none', value: 0, message: 'Chúc bạn may mắn lần sau!' },
    ] as const;
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    const gameId = uuidv4();
    this.scratchGames.set(gameId, { userId, reward, createdAt: new Date() });

    return { gameId, tickets: user.minigame_tickets };
  }

  async revealScratch(userId: number, gameId: string) {
    const game = this.scratchGames.get(gameId);
    if (!game || game.userId !== userId) {
      throw new NotFoundException('Game not found or expired');
    }
    const { reward } = game;
    this.scratchGames.delete(gameId);

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    let couponGranted = false;
    let couponCode: string | null = null;

    if (reward.type === 'points') {
      user.points += reward.value as number;
    } else if (reward.type === 'coupon') {
      couponGranted = true;
      couponCode = reward.value as string;
      // Optionally, assign coupon to user here
    }
    await this.usersRepository.save(user);

    return {
      rewardType: reward.type,
      rewardValue: reward.value,
      message: reward.message,
      tickets: user.minigame_tickets,
      totalPoints: user.points,
      couponGranted,
      couponCode,
    };
  }

  async claimDailyFreeTicket(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const today = new Date();
    today.setHours(0, 0, 0);
    if (user.lastFreeTicketClaim) {
      const lastClaim = new Date(user.lastFreeTicketClaim);
      if (!isNaN(lastClaim.getTime())) {
        // Now you can safely use lastClaim.getTime()
        if (lastClaim.getTime() < today.getTime()) {
          user.minigame_tickets += 1;
          user.lastFreeTicketClaim = today;
          await this.usersRepository.save(user);
          return { message: 'Bạn đã nhận vé miễn phí hôm nay!', tickets: user.minigame_tickets };
        } else {
          return { message: 'Bạn đã nhận vé miễn phí hôm nay rồi. Hãy quay lại vào ngày mai!', tickets: user.minigame_tickets };
        }
      } else {
        // Handle invalid date if needed
      }
    } else {
      user.minigame_tickets += 1;
      user.lastFreeTicketClaim = today;
      await this.usersRepository.save(user);
      return { message: 'Bạn đã nhận vé miễn phí hôm nay!', tickets: user.minigame_tickets };
    }
  }

  async getTicketCount(userId: number): Promise<number> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    return user?.minigame_tickets ?? 0;
  }

  async getUserPoints(userId: number): Promise<number> {
    // Fetch the user's points from DB or cache
    // Example:
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    return user?.points ?? 0;
  }

  private getWinLines(grid: string[][]): Array<{ type: "row" | "col" | "diag", index: number }> {
    const winLines: Array<{ type: "row" | "col" | "diag", index: number }> = [];
    // Rows
    for (let i = 0; i < 3; i++) {
      if (grid[i][0] && grid[i][0] === grid[i][1] && grid[i][1] === grid[i][2]) {
        winLines.push({ type: "row", index: i });
      }
    }
    // Columns
    for (let j = 0; j < 3; j++) {
      if (grid[0][j] && grid[0][j] === grid[1][j] && grid[1][j] === grid[2][j]) {
        winLines.push({ type: "col", index: j });
      }
    }
    // Diagonal 1
    if (grid[0][0] && grid[0][0] === grid[1][1] && grid[1][1] === grid[2][2]) {
      winLines.push({ type: "diag", index: 1 });
    }
    // Diagonal 2
    if (grid[0][2] && grid[0][2] === grid[1][1] && grid[1][1] === grid[2][0]) {
      winLines.push({ type: "diag", index: 2 });
    }
    return winLines;
  }

  async notifyCouponGranted(user: User, couponCode: string) {
    const subject = 'Pengoo - You’ve Earned a Coupon!';
    const redeemUrl = `https://pengoo.store/account/voucher?code=${couponCode}`;
    const message = `
        Hello ${user.full_name || user.email},

        Congratulations! You have reached a point milestone and earned a coupon code: ${couponCode}

        You can redeem your coupon by visiting the following link:
        ${redeemUrl}

        Thank you for playing and shopping with Pengoo!

        Best regards,
        Pengoo Team
    `;
    await this.notificationsService.sendEmail(
        user.email,
        subject,
        message
    );
  }
}

import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { CouponsService } from '../coupons/coupons.service';
import { TicketEarningLog, TicketEarningType } from './ticket-earning-log.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { UserCoupon } from '../coupons/user-coupon.entity';
export declare class MinigameService {
    private usersRepository;
    private ticketEarningLogRepository;
    private couponsService;
    private userCouponRepo;
    private notificationsService;
    private readonly COUPON_POINT_THRESHOLD;
    private readonly MAX_TICKETS_PER_DAY;
    private readonly SCRATCH_SYMBOLS;
    private readonly SCRATCH_GRID_SIZE;
    private scratchGames;
    constructor(usersRepository: Repository<User>, ticketEarningLogRepository: Repository<TicketEarningLog>, couponsService: CouponsService, userCouponRepo: Repository<UserCoupon>, notificationsService: NotificationsService);
    submitScore(userId: number, score: number): Promise<{
        message: string;
        tickets: number;
        points?: undefined;
        couponGranted?: undefined;
        couponCode?: undefined;
    } | {
        message: string;
        points: number;
        tickets: number;
        couponGranted: boolean;
        couponCode: string;
    } | {
        message: string;
        points: number;
        tickets: number;
        couponGranted?: undefined;
        couponCode?: undefined;
    }>;
    addTicket(userId: number, type: TicketEarningType, refId?: string): Promise<{
        message: string;
        tickets: number;
    }>;
    playScratch(userId: number): Promise<{
        message: string;
        tickets: number;
        grid?: undefined;
        winLines?: undefined;
        gridScore?: undefined;
        bonus?: undefined;
        totalPoints?: undefined;
        couponGranted?: undefined;
        couponCode?: undefined;
        userPoints?: undefined;
    } | {
        grid: string[][];
        winLines: {
            type: "row" | "col" | "diag";
            index: number;
        }[];
        gridScore: number;
        bonus: number;
        totalPoints: number;
        tickets: number;
        couponGranted: boolean;
        couponCode: string | null;
        message: string;
        userPoints: number;
    }>;
    startScratch(userId: number): Promise<{
        message: string;
        tickets: number;
        gameId?: undefined;
    } | {
        gameId: string;
        tickets: number;
        message?: undefined;
    }>;
    revealScratch(userId: number, gameId: string): Promise<{
        rewardType: "coupon" | "points" | "none";
        rewardValue: string | number;
        message: string;
        tickets: number;
        totalPoints: number;
        couponGranted: boolean;
        couponCode: string | null;
    }>;
    claimDailyFreeTicket(userId: number): Promise<{
        message: string;
        tickets: number;
    } | undefined>;
    getTicketCount(userId: number): Promise<number>;
    getUserPoints(userId: number): Promise<number>;
    private getWinLines;
    notifyCouponGranted(user: User, couponCode: string): Promise<void>;
}

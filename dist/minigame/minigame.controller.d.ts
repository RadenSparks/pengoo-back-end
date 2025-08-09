import { MinigameService } from './minigame.service';
import { SubmitScoreDto } from './dto/submit-score.dto';
import { TicketEarningType } from './ticket-earning-log.entity';
export declare class MinigameController {
    private readonly minigameService;
    constructor(minigameService: MinigameService);
    submitScore(req: any, dto: SubmitScoreDto): Promise<{
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
    earnTicket(req: any, body: {
        type: TicketEarningType;
        refId?: string;
    }): Promise<{
        message: string;
        tickets: number;
    }>;
    playScratch(req: any): Promise<{
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
    startScratch(req: any): Promise<{
        message: string;
        tickets: number;
        gameId?: undefined;
    } | {
        gameId: string;
        tickets: number;
        message?: undefined;
    }>;
    revealScratch(req: any, body: {
        gameId: string;
    }): Promise<{
        rewardType: "coupon" | "points" | "none";
        rewardValue: string | number;
        message: string;
        tickets: number;
        totalPoints: number;
        couponGranted: boolean;
        couponCode: string | null;
    }>;
    claimDailyTicket(req: any): Promise<{
        message: string;
        tickets: number;
    } | undefined>;
    getTicketCount(req: any): Promise<{
        tickets: number;
    }>;
    getUserPoints(req: any): Promise<{
        userPoints: number;
    }>;
}

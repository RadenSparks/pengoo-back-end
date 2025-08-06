"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinigameService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const coupons_service_1 = require("../coupons/coupons.service");
const ticket_earning_log_entity_1 = require("./ticket-earning-log.entity");
const notifications_service_1 = require("../notifications/notifications.service");
const crypto_1 = require("crypto");
const user_coupon_entity_1 = require("../coupons/user-coupon.entity");
const uuid_1 = require("uuid");
let MinigameService = class MinigameService {
    usersRepository;
    ticketEarningLogRepository;
    couponsService;
    userCouponRepo;
    notificationsService;
    COUPON_POINT_THRESHOLD = 1000;
    MAX_TICKETS_PER_DAY = 3;
    SCRATCH_SYMBOLS = [
        'ssrb.png',
        'takodachi.png',
        'bubba.png',
        'bloob.png',
        'greenssrb.png'
    ];
    SCRATCH_GRID_SIZE = 3;
    scratchGames = new Map();
    constructor(usersRepository, ticketEarningLogRepository, couponsService, userCouponRepo, notificationsService) {
        this.usersRepository = usersRepository;
        this.ticketEarningLogRepository = ticketEarningLogRepository;
        this.couponsService = couponsService;
        this.userCouponRepo = userCouponRepo;
        this.notificationsService = notificationsService;
    }
    async submitScore(userId, score) {
        const user = await this.usersRepository.findOne({ where: { id: userId }, relations: ['coupons'] });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.minigame_tickets <= 0) {
            return { message: 'No tickets left.', tickets: user.minigame_tickets };
        }
        user.minigame_tickets -= 1;
        user.points += score;
        await this.usersRepository.save(user);
        const activeCoupon = await this.couponsService.findActiveCoupon();
        const hasCoupon = activeCoupon
            ? await this.userCouponRepo.findOne({ where: { user: { id: userId }, coupon: { id: activeCoupon.id } } })
            : null;
        if (activeCoupon && user.points >= this.COUPON_POINT_THRESHOLD && !hasCoupon) {
            const redeemToken = (0, crypto_1.randomBytes)(32).toString('hex');
            const userCoupon = this.userCouponRepo.create({
                user,
                coupon: activeCoupon,
                redeemed: false,
                redeemToken,
            });
            await this.userCouponRepo.save(userCoupon);
            const redeemUrl = `https://pengoo.store/redeem-coupon?token=${redeemToken}`;
            await this.notificationsService.sendEmail(user.email, 'Redeem your coupon!', `Congratulations! You earned a coupon. Click here to redeem: ${redeemUrl}`);
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
    async addTicket(userId, type, refId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (refId) {
            const existing = await this.ticketEarningLogRepository.findOne({
                where: { user: { id: userId }, type, refId },
            });
            if (existing) {
                return { message: 'Already earned a ticket for this action.', tickets: user.minigame_tickets };
            }
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const earnedToday = await this.ticketEarningLogRepository.count({
            where: {
                user: { id: userId },
                createdAt: (0, typeorm_2.Between)(today, tomorrow),
            },
        });
        if (earnedToday >= this.MAX_TICKETS_PER_DAY) {
            return { message: 'Reached ticket earning limit for today.', tickets: user.minigame_tickets };
        }
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
    async playScratch(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.minigame_tickets <= 0) {
            return { message: 'No tickets left.', tickets: user.minigame_tickets };
        }
        user.minigame_tickets -= 1;
        const grid = [];
        for (let i = 0; i < this.SCRATCH_GRID_SIZE; i++) {
            grid[i] = [];
            for (let j = 0; j < this.SCRATCH_GRID_SIZE; j++) {
                const token = this.SCRATCH_SYMBOLS[Math.floor(Math.random() * this.SCRATCH_SYMBOLS.length)];
                grid[i][j] = token;
            }
        }
        const winLines = this.getWinLines(grid);
        const gridScore = winLines.length * 100;
        const bonus = winLines.length > 0 ? 50 * winLines.length : 0;
        const totalPoints = gridScore + bonus;
        let message = '';
        let couponGranted = false;
        let couponCode = null;
        if (winLines.length > 0) {
            message = `Chúc mừng! Bạn có ${winLines.length} hàng thắng và nhận được ${totalPoints} điểm!`;
        }
        else {
            message = "Không có hàng thắng nào. Chúc bạn may mắn lần sau!";
        }
        user.points += totalPoints;
        await this.usersRepository.save(user);
        const activeCoupon = await this.couponsService.findActiveCoupon();
        if (activeCoupon && user.points >= this.COUPON_POINT_THRESHOLD) {
            const hasCoupon = await this.userCouponRepo.findOne({
                where: { user: { id: userId }, coupon: { id: activeCoupon.id } }
            });
            if (!hasCoupon) {
                const redeemToken = (0, crypto_1.randomBytes)(32).toString('hex');
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
            userPoints: user.points,
        };
    }
    async startScratch(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.minigame_tickets <= 0) {
            return { message: 'No tickets left.', tickets: user.minigame_tickets };
        }
        user.minigame_tickets -= 1;
        await this.usersRepository.save(user);
        const rewards = [
            { type: 'points', value: 100, message: 'Bạn nhận được 100 điểm!' },
            { type: 'points', value: 200, message: 'Bạn nhận được 200 điểm!' },
            { type: 'coupon', value: 'SALE50', message: 'Bạn nhận được coupon SALE50!' },
            { type: 'none', value: 0, message: 'Chúc bạn may mắn lần sau!' },
        ];
        const reward = rewards[Math.floor(Math.random() * rewards.length)];
        const gameId = (0, uuid_1.v4)();
        this.scratchGames.set(gameId, { userId, reward, createdAt: new Date() });
        return { gameId, tickets: user.minigame_tickets };
    }
    async revealScratch(userId, gameId) {
        const game = this.scratchGames.get(gameId);
        if (!game || game.userId !== userId) {
            throw new common_1.NotFoundException('Game not found or expired');
        }
        const { reward } = game;
        this.scratchGames.delete(gameId);
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        let couponGranted = false;
        let couponCode = null;
        if (reward.type === 'points') {
            user.points += reward.value;
        }
        else if (reward.type === 'coupon') {
            couponGranted = true;
            couponCode = reward.value;
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
    async claimDailyFreeTicket(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const today = new Date();
        today.setHours(0, 0, 0);
        if (user.lastFreeTicketClaim) {
            const lastClaim = new Date(user.lastFreeTicketClaim);
            if (!isNaN(lastClaim.getTime())) {
                if (lastClaim.getTime() < today.getTime()) {
                    user.minigame_tickets += 1;
                    user.lastFreeTicketClaim = today;
                    await this.usersRepository.save(user);
                    return { message: 'Bạn đã nhận vé miễn phí hôm nay!', tickets: user.minigame_tickets };
                }
                else {
                    return { message: 'Bạn đã nhận vé miễn phí hôm nay rồi. Hãy quay lại vào ngày mai!', tickets: user.minigame_tickets };
                }
            }
            else {
            }
        }
        else {
            user.minigame_tickets += 1;
            user.lastFreeTicketClaim = today;
            await this.usersRepository.save(user);
            return { message: 'Bạn đã nhận vé miễn phí hôm nay!', tickets: user.minigame_tickets };
        }
    }
    async getTicketCount(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        return user?.minigame_tickets ?? 0;
    }
    async getUserPoints(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        return user?.points ?? 0;
    }
    getWinLines(grid) {
        const winLines = [];
        for (let i = 0; i < 3; i++) {
            if (grid[i][0] && grid[i][0] === grid[i][1] && grid[i][1] === grid[i][2]) {
                winLines.push({ type: "row", index: i });
            }
        }
        for (let j = 0; j < 3; j++) {
            if (grid[0][j] && grid[0][j] === grid[1][j] && grid[1][j] === grid[2][j]) {
                winLines.push({ type: "col", index: j });
            }
        }
        if (grid[0][0] && grid[0][0] === grid[1][1] && grid[1][1] === grid[2][2]) {
            winLines.push({ type: "diag", index: 1 });
        }
        if (grid[0][2] && grid[0][2] === grid[1][1] && grid[1][1] === grid[2][0]) {
            winLines.push({ type: "diag", index: 2 });
        }
        return winLines;
    }
};
exports.MinigameService = MinigameService;
exports.MinigameService = MinigameService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(ticket_earning_log_entity_1.TicketEarningLog)),
    __param(3, (0, typeorm_1.InjectRepository)(user_coupon_entity_1.UserCoupon)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        coupons_service_1.CouponsService,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], MinigameService);
//# sourceMappingURL=minigame.service.js.map
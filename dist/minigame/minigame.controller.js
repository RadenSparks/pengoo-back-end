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
exports.MinigameController = void 0;
const common_1 = require("@nestjs/common");
const minigame_service_1 = require("./minigame.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const submit_score_dto_1 = require("./dto/submit-score.dto");
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const typeorm_2 = require("@nestjs/typeorm");
let MinigameController = class MinigameController {
    minigameService;
    usersRepository;
    constructor(minigameService, usersRepository) {
        this.minigameService = minigameService;
        this.usersRepository = usersRepository;
    }
    async submitScore(req, dto) {
        const userId = req.user.id;
        return this.minigameService.submitScore(userId, dto.score);
    }
    async earnTicket(req, body) {
        const userId = req.user.id;
        return this.minigameService.addTicket(userId, body.type, body.refId);
    }
    async playScratch(req) {
        const userId = req.user.id;
        return this.minigameService.playScratch(userId);
    }
    async startScratch(req) {
        const userId = req.user.id;
        return this.minigameService.startScratch(userId);
    }
    async revealScratch(req, body) {
        const userId = req.user.id;
        return this.minigameService.revealScratch(userId, body.gameId);
    }
    async claimDailyTicket(req) {
        const userId = req.user.id;
        return this.minigameService.claimDailyFreeTicket(userId);
    }
    async getTicketCount(req) {
        const userId = req.user.id;
        const tickets = await this.minigameService.getTicketCount(userId);
        return { tickets };
    }
    async getUserPoints(req) {
        const userId = req.user.id;
        const userPoints = await this.minigameService.getUserPoints(userId);
        return { userPoints };
    }
    async getDailyClaimStatus(req) {
        const userId = req.user.id;
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        const today = new Date();
        today.setHours(0, 0, 0);
        const lastClaim = user?.lastFreeTicketClaim ? new Date(user.lastFreeTicketClaim) : null;
        const claimed = lastClaim && lastClaim.getTime() >= today.getTime();
        return { claimed };
    }
};
exports.MinigameController = MinigameController;
__decorate([
    (0, common_1.Post)('submit-score'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Submit a minigame score and consume a ticket' }),
    (0, swagger_1.ApiBody)({
        type: submit_score_dto_1.SubmitScoreDto,
        examples: {
            default: {
                summary: 'Submit score',
                value: { score: 150 },
            },
        },
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, submit_score_dto_1.SubmitScoreDto]),
    __metadata("design:returntype", Promise)
], MinigameController.prototype, "submitScore", null);
__decorate([
    (0, common_1.Post)('earn-ticket'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Earn a minigame ticket by action' }),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                type: 'post',
                refId: '123',
            },
        },
        description: 'Type: post, product, or social. refId is optional.',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MinigameController.prototype, "earnTicket", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('play-scratch'),
    (0, swagger_1.ApiOperation)({ summary: 'Play the scratch minigame (consumes a ticket)' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MinigameController.prototype, "playScratch", null);
__decorate([
    (0, common_1.Post)('play-scratch/start'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Start a scratch game (deducts a ticket, returns gameId)' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MinigameController.prototype, "startScratch", null);
__decorate([
    (0, common_1.Post)('play-scratch/reveal'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Reveal scratch result (returns grid and rewards)' }),
    (0, swagger_1.ApiBody)({ schema: { example: { gameId: '...' } } }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MinigameController.prototype, "revealScratch", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('claim-daily-ticket'),
    (0, swagger_1.ApiOperation)({ summary: 'Claim your daily free minigame ticket' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MinigameController.prototype, "claimDailyTicket", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('ticket-count'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user minigame ticket count' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MinigameController.prototype, "getTicketCount", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('user-points'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MinigameController.prototype, "getUserPoints", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('daily-claim-status'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MinigameController.prototype, "getDailyClaimStatus", null);
exports.MinigameController = MinigameController = __decorate([
    (0, swagger_1.ApiTags)('Minigame'),
    (0, common_1.Controller)('minigame'),
    __param(1, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [minigame_service_1.MinigameService,
        typeorm_1.Repository])
], MinigameController);
//# sourceMappingURL=minigame.controller.js.map
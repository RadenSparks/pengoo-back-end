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
exports.DeliveryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const delivery_entity_1 = require("./delivery.entity");
let DeliveryService = class DeliveryService {
    deliveryRepository;
    constructor(deliveryRepository) {
        this.deliveryRepository = deliveryRepository;
    }
    create(dto) {
        const delivery = this.deliveryRepository.create(dto);
        return this.deliveryRepository.save(delivery);
    }
    findAll() {
        return this.deliveryRepository.find();
    }
    async findById(id) {
        const delivery = await this.deliveryRepository.findOne({ where: { id } });
        if (!delivery)
            throw new common_1.NotFoundException('Delivery method not found');
        return delivery;
    }
    async update(id, dto) {
        const delivery = await this.findById(id);
        Object.assign(delivery, dto);
        return this.deliveryRepository.save(delivery);
    }
    async remove(id) {
        const delivery = await this.findById(id);
        return this.deliveryRepository.remove(delivery);
    }
};
exports.DeliveryService = DeliveryService;
exports.DeliveryService = DeliveryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(delivery_entity_1.Delivery)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DeliveryService);
//# sourceMappingURL=delivery.service.js.map
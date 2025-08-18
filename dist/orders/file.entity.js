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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadFiles = void 0;
const typeorm_1 = require("typeorm");
const refund_request_entity_1 = require("./refund-request.entity");
let UploadFiles = class UploadFiles {
    id;
    refundRequest;
    type;
    url;
    created_at;
};
exports.UploadFiles = UploadFiles;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UploadFiles.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => refund_request_entity_1.RefundRequest, (refundRequest) => refundRequest.uploadFiles, { eager: true }),
    __metadata("design:type", refund_request_entity_1.RefundRequest)
], UploadFiles.prototype, "refundRequest", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], UploadFiles.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], UploadFiles.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UploadFiles.prototype, "created_at", void 0);
exports.UploadFiles = UploadFiles = __decorate([
    (0, typeorm_1.Entity)('upload_files')
], UploadFiles);
//# sourceMappingURL=file.entity.js.map
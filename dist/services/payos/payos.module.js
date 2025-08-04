"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayosModule = void 0;
const common_1 = require("@nestjs/common");
const payos_service_1 = require("./payos.service");
const invoices_module_1 = require("../invoices/invoices.module");
let PayosModule = class PayosModule {
};
exports.PayosModule = PayosModule;
exports.PayosModule = PayosModule = __decorate([
    (0, common_1.Module)({
        imports: [invoices_module_1.InvoicesModule],
        providers: [payos_service_1.PayosService],
        exports: [payos_service_1.PayosService],
    })
], PayosModule);
//# sourceMappingURL=payos.module.js.map
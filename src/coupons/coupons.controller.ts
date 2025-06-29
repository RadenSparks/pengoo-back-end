
import { Controller, Post, Body, Get, Query, BadRequestException, UseGuards, Req, Patch, Param, Delete } from '@nestjs/common';

import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCoupon } from './user-coupon.entity';

import { Public } from '../auth/public.decorator';
import { ApiTags, ApiBody, ApiQuery, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateCouponDto } from './dto/update-coupon.dto';


@ApiTags('Coupons')
@Controller('coupons')
export class CouponsController {
  constructor(
    private readonly couponsService: CouponsService,
    @InjectRepository(UserCoupon)
    private userCouponRepo: Repository<UserCoupon>,
  ) { }

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create a new coupon' })
  @ApiBody({
    type: CreateCouponDto,
    examples: {
      default: {
        summary: 'Create coupon',
        value: {
          code: 'SUMMER2025',
          minOrderValue: 100000,
          maxOrderValue: 1000000,
          startDate: '2025-06-01',
          endDate: '2025-07-01',
          usageLimit: 100,
          discountPercent: 10,
          status: 'active',
          productIds: [1, 2],
          userIds: [3, 4],
        },
      },
    },
  })
  create(@Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto);
  }

  @Post('validate')
  @ApiBody({
    type: CreateCouponDto,
    examples: {
      default: {
        summary: 'Example product',
        value: {
          code: "HUYDEPTRAI",
          orderValue: 1000,
          userId: 1,
          product: [1, 2]
        }
      }
    }
  })
  @Public()
  @ApiOperation({ summary: 'Validate and apply a coupon to an order' })
  @ApiBody({
    schema: {
      example: {
        code: 'SUMMER2025',
        orderValue: 200000,
        userId: 3,
        productIds: [1, 2],
      },
    },
    description: 'Validate a coupon code for a user and order value',
  })
  validate(@Body() body: { code: string; orderValue: number; userId: number; productIds: number[] }) {
    return this.couponsService.validateAndApply(body.code, body.orderValue, body.userId, body.productIds);
  }

  @Get('redeem')
  @Public()
  @ApiOperation({ summary: 'Redeem a coupon using a token' })
  @ApiQuery({
    name: 'token',
    type: String,
    example: 'abc123token',
    description: 'Redemption token sent to user',
    required: true,
  })
  async redeemCoupon(@Query('token') token: string) {
    const userCoupon = await this.userCouponRepo.findOne({ where: { redeemToken: token }, relations: ['coupon', 'user'] });
    if (!userCoupon) throw new BadRequestException('Invalid or expired token');
    if (userCoupon.redeemed) throw new BadRequestException('Coupon already redeemed');

    userCoupon.redeemed = true;
    userCoupon.redeemedAt = new Date();
    await this.userCouponRepo.save(userCoupon);

    return { message: 'Coupon redeemed! You can now use it.', coupon: userCoupon.coupon.code };
  }

  @Patch(':id')
  @Public()
  update(@Param('id') id: number, @Body() dto: UpdateCouponDto) {
    return this.couponsService.update(+id, dto);
  }
  @Get()
  @Public()
  getAll() {
    return this.couponsService.getAll();
  }
  @Delete(':id')
  @Public()
  delete(@Param('id') id: number) {
    return this.couponsService.delete(id);
  }

  @Patch(':id/:status/status')
  @Public()
  updateStatus(@Param('id') id: number, @Param('status') status: any) {
    return this.couponsService.updateStatus(+id, status);
  }

  @UseGuards(JwtAuthGuard)
  @Get('next-milestone-coupon')
  @ApiOperation({ summary: 'Get next available coupon for user milestone' })
  @ApiQuery({ name: 'userPoints', type: Number, required: true })
  async getNextMilestoneCoupon(@Req() req, @Query('userPoints') userPoints: number) {
    const userId = req.user.id;
    const coupon = await this.couponsService.getNextAvailableCoupon(userId, Number(userPoints));
    if (!coupon) return { coupon: null };
    return { coupon: { code: coupon.code, discount: coupon.discountPercent } };
  }

  @UseGuards(JwtAuthGuard)
  @Get('milestone-coupons')
  @ApiOperation({ summary: 'Get all milestone coupons' })
  async getMilestoneCoupons() {
    // Only coupons with milestonePoints set and active
    const coupons = await this.couponsService.getMilestoneCoupons();
    return { coupons };
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-vouchers')
  @ApiOperation({ summary: 'Get all vouchers owned by the current user' })
  async getMyVouchers(@Req() req) {
    const userId = req.user.id;
    const vouchers = await this.userCouponRepo.find({
      where: { user: { id: userId } },
      relations: ['coupon'],
      order: { id: 'DESC' }
    });
    return { vouchers };
  }
  @UseGuards(JwtAuthGuard)
  @Post('verify-voucher')
  @ApiOperation({ summary: 'Get all vouchers owned by the current user' })
  async checkVoucherByUserPoint(@Req() req, @Body() data: { voucherCode: string }) {
    return this.couponsService.checkVoucherByUserPoint(req.user, data.voucherCode)
  }
  @UseGuards(JwtAuthGuard)
  @Post('get-voucher-by-userId')
  @ApiOperation({ summary: 'Get all vouchers owned by the current user' })
  async getVoucherByUserId(@Req() req) {
    return this.couponsService.getVoucherByUserId(req.user.id)
  }
}
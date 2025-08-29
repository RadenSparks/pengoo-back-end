import { Controller, Post, Delete, Get, Param, Body, Query, BadRequestException } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
// Swagger imports
import { ApiTags, ApiBody, ApiParam, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

interface WishlistBody {
  userId: number;
}

@ApiTags('Wishlist')
@ApiBearerAuth()
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) { }

  @Post(':productId')
  @ApiOperation({ summary: 'Add product to wishlist' })
  @ApiParam({ name: 'productId', type: Number, required: true })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number', example: 1 },
      },
      required: ['userId'],
    },
    examples: {
      user: {
        summary: 'Add to wishlist',
        value: { userId: 1 },
      },
    },
  })
  addToWishlist(@Body() body: WishlistBody, @Param('productId') productId: string) {
    const userId = Number(body.userId);
    const prodId = Number(productId);
    if (!body || isNaN(userId) || isNaN(prodId)) {
      throw new BadRequestException('userId và productId là bắt buộc và phải là số');
    }
    return this.wishlistService.addToWishlist(userId, prodId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  @ApiParam({ name: 'productId', type: Number, required: true })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number', example: 1 },
      },
      required: ['userId'],
    },
    examples: {
      user: {
        summary: 'Remove from wishlist',
        value: { userId: 1 },
      },
    },
  })
  removeFromWishlist(@Body() body: WishlistBody, @Param('productId') productId: string) {
    const userId = Number(body.userId);
    if (!body || isNaN(userId)) {
      throw new BadRequestException('userId là bắt buộc và phải là số');
    }
    return this.wishlistService.removeFromWishlist(userId, Number(productId));
  }

  @Get()
  @ApiOperation({ summary: 'View wishlist' })
  @ApiQuery({ name: 'userId', type: Number, required: true })
  async viewWishlist(@Query('userId') userId: number) {
    const items = await this.wishlistService.viewWishlist(Number(userId));
    return items.map(item => {
      const product = item.product as any;
      // Filter out soft-deleted images
      const imagesArr = Array.isArray(product.images)
        ? product.images.filter((img: any) => !img.deletedAt)
        : [];
      let mainImage = '';
      if (imagesArr.length > 0) {
        const mainImgObj = imagesArr.find((img: any) => img.name === 'main');
        mainImage = mainImgObj?.url || imagesArr[0]?.url || '';
      }
      return {
        ...item,
        product: {
          ...product,
          image: mainImage,
          images: imagesArr,
        },
      };
    });
  }

  @Post('move-to-order/:orderId')
  @ApiOperation({ summary: 'Move wishlist items to order' })
  @ApiParam({ name: 'orderId', type: Number, required: true })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number', example: 1 },
      },
      required: ['userId'],
    },
    examples: {
      user: {
        summary: 'Move to order',
        value: { userId: 1 },
      },
    },
  })
  async moveToOrder(@Body() body: WishlistBody, @Param('orderId') orderId: string) {
    const userId = Number(body.userId);
    if (!body || isNaN(userId)) {
      throw new BadRequestException('userId là bắt buộc và phải là số');
    }
    return this.wishlistService.moveWishlistToOrder(userId, Number(orderId));
  }
}

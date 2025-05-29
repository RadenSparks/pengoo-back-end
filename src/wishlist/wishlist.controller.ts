import { Controller, Post, Delete, Get, Param, Req } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { Request } from 'express';

// Extend Express Request interface to include user property
interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    [key: string]: any;
  };
}

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post(':productId')
  addToWishlist(@Req() req: AuthenticatedRequest, @Param('productId') productId: string) {
    const userId = req.user.id;
    return this.wishlistService.addToWishlist(userId, Number(productId));
  }

  @Delete(':productId')
  removeFromWishlist(@Req() req: AuthenticatedRequest, @Param('productId') productId: string) {
    const userId = req.user.id;
    return this.wishlistService.removeFromWishlist(userId, Number(productId));
  }

  @Get()
  viewWishlist(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.wishlistService.viewWishlist(userId);
  }
}

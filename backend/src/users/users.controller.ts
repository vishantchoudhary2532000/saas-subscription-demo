import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      return { error: 'User not found' };
    }
    return {
      id: user._id,
      email: user.email,
      isPaid: user.isPaid,
    };
  }

  @Get('protected')
  @UseGuards(JwtAuthGuard)
  async getProtectedData(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      return { error: 'User not found' };
    }
    if (!user.isPaid) {
      return { error: 'Subscription required' };
    }
    return {
      message: 'This is protected data for paid users only',
      data: 'Premium content here',
    };
  }
}

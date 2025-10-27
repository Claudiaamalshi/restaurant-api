import { Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { AuthenticatedRequest } from '../types';
import {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
} from '../validators/auth.validator';

export class AuthController {
  /**
   * POST /api/v1/auth/register
   * Register a new user
   */
  async register(
    req: AuthenticatedRequest<RegisterInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, tokens } = await authService.register(req.body);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user,
          tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/login
   * Login user
   */
  async login(
    req: AuthenticatedRequest<LoginInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { user, tokens } = await authService.login(req.body);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token
   */
  async refresh(
    req: AuthenticatedRequest<RefreshTokenInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const tokens = await authService.refreshAccessToken(req.body.refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: { tokens },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Logout user
   */
  async logout(
    req: AuthenticatedRequest<RefreshTokenInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await authService.logout(req.body.refreshToken);

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/me
   * Get current user profile
   */
  async getProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        data: { user: req.user },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
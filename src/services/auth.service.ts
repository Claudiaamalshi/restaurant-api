import User from '../models/User';
import RefreshToken from '../models/RefreshToken';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt.util';
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
  TooManyRequestsError,
  AuthorizationError,
} from '../utils/errors';
import { TokenPair, TokenPayload, UserRole } from '../types';
import { RegisterInput, LoginInput } from '../validators/auth.validator';

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterInput): Promise<{ user: User; tokens: TokenPair }> {
    // Reject attempt to create ADMIN via public registration
    if ((data.role as UserRole) === UserRole.ADMIN) {
      throw new AuthorizationError('Admin creation is restricted to server-side operations only');
    }
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Create user (password will be hashed in beforeCreate hook)
    const user = await User.create(data);

    // Ensure user ID is populated
    if (!user.id) {
      await user.reload();
    }

    // Generate tokens
    const tokens = await this.generateTokensForUser(user);

    return { user, tokens };
  }

  /**
   * Login user
   */
  async login(data: LoginInput): Promise<{ user: User; tokens: TokenPair }> {
    // Find user
    const user = await User.findOne({ where: { email: data.email } });
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Check if account is locked
    if (user.isLockedOut()) {
      const lockoutMinutes = Math.ceil(
        (user.lockoutUntil!.getTime() - Date.now()) / 60000
      );
      throw new TooManyRequestsError(
        `Account locked due to too many failed attempts. Try again in ${lockoutMinutes} minutes`
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      await user.incrementFailedAttempts();
      throw new AuthenticationError('Invalid credentials');
    }

    // Reset failed attempts on successful login
    if (user.failedLoginAttempts > 0) {
      await user.resetFailedAttempts();
    }

    // Generate tokens
    const tokens = await this.generateTokensForUser(user);

    return { user, tokens };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshTokenString: string): Promise<TokenPair> {
    // Verify refresh token signature
    const payload = verifyRefreshToken(refreshTokenString);

    // Find refresh token in database
    const refreshToken = await RefreshToken.findOne({
      where: { token: refreshTokenString },
      include: [{ model: User, as: 'user' }],
    });

    if (!refreshToken || !refreshToken.isValid()) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    // Get user
    const user = await User.findByPk(payload.userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Revoke old refresh token (rotation)
    refreshToken.isRevoked = true;
    await refreshToken.save();

    // Generate new token pair
    const newTokens = await this.generateTokensForUser(user);

    return newTokens;
  }

  /**
   * Logout user (revoke refresh token)
   */
  async logout(refreshTokenString: string): Promise<void> {
    const refreshToken = await RefreshToken.findOne({
      where: { token: refreshTokenString },
    });

    if (refreshToken) {
      refreshToken.isRevoked = true;
      await refreshToken.save();
    }
  }

  /**
   * Generate and store token pair for user
   */
  private async generateTokensForUser(user: User): Promise<TokenPair> {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokenPair(payload);

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await RefreshToken.create({
      userId: user.id,
      token: tokens.refreshToken,
      expiresAt,
    });

    // Clean up expired tokens for this user
    await this.cleanupExpiredTokens(user.id);

    return tokens;
  }

  /**
   * Clean up expired refresh tokens for a user
   */
  private async cleanupExpiredTokens(userId: string): Promise<void> {
    await RefreshToken.destroy({
      where: {
        userId,
        expiresAt: { $lt: new Date() },
      },
    });
  }
}

export default new AuthService();
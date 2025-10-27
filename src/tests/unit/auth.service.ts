import authService from '../../services/auth.service';
import User from '../../models/User';
import RefreshToken from '../../models/RefreshToken';
import { ConflictError, AuthenticationError } from '../../utils/errors';
import sequelize from '../../config/database';
import { UserRole } from '../../types';

describe('AuthService Unit Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await RefreshToken.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      const result = await authService.register({
        email: 'test@example.com',
        password: 'Test@1234',
        role: UserRole.CUSTOMER,
      });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();

      const refreshToken = await RefreshToken.findOne({
        where: { userId: result.user.id },
      });
      expect(refreshToken).toBeDefined();
    });

    it('should hash password before storing', async () => {
      const password = 'Test@1234';
      const result = await authService.register({
        email: 'test@example.com',
        password,
        role: UserRole.CUSTOMER,
      });

      const user = await User.findByPk(result.user.id);
      expect(user?.password).not.toBe(password);
      expect(user?.password).toMatch(/^\$2[aby]\$/); // bcrypt hash format
    });

    it('should throw ConflictError if email already exists', async () => {
      await authService.register({
        email: 'test@example.com',
        password: 'Test@1234',
        role: UserRole.CUSTOMER,
      });

      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'Test@1234',
          role: UserRole.CUSTOMER,
        })
      ).rejects.toThrow(ConflictError);
    });

    it('should normalize email to lowercase', async () => {
      const result = await authService.register({
        email: 'TEST@EXAMPLE.COM',
        password: 'Test@1234',
        role: UserRole.CUSTOMER,
      });

      expect(result.user.email).toBe('test@example.com');
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await authService.register({
        email: 'test@example.com',
        password: 'Test@1234',
        role: UserRole.CUSTOMER,
      });
    });

    it('should login with correct credentials', async () => {
      const result = await authService.login({
        email: 'test@example.com',
        password: 'Test@1234',
      });

      expect(result.user).toBeDefined();
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('should throw AuthenticationError with wrong password', async () => {
      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'WrongPassword@123',
        })
      ).rejects.toThrow(AuthenticationError);
    });

    it('should throw AuthenticationError with non-existent email', async () => {
      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: 'Test@1234',
        })
      ).rejects.toThrow(AuthenticationError);
    });

    it('should increment failed attempts on wrong password', async () => {
      try {
        await authService.login({
          email: 'test@example.com',
          password: 'WrongPassword@123',
        });
      } catch (error) {
        // Expected to fail
      }

      const user = await User.findOne({ where: { email: 'test@example.com' } });
      expect(user?.failedLoginAttempts).toBe(1);
    });

    it('should reset failed attempts on successful login', async () => {
      const user = await User.findOne({ where: { email: 'test@example.com' } });
      if (user) {
        user.failedLoginAttempts = 3;
        await user.save();
      }

      await authService.login({
        email: 'test@example.com',
        password: 'Test@1234',
      });

      const updatedUser = await User.findOne({ where: { email: 'test@example.com' } });
      expect(updatedUser?.failedLoginAttempts).toBe(0);
    });
  });

  describe('refreshAccessToken', () => {
    let refreshTokenString: string;

    beforeEach(async () => {
      const result = await authService.register({
        email: 'test@example.com',
        password: 'Test@1234',
        role: UserRole.CUSTOMER,
      });
      refreshTokenString = result.tokens.refreshToken;
    });

    it('should generate new token pair', async () => {
      const newTokens = await authService.refreshAccessToken(refreshTokenString);

      expect(newTokens.accessToken).toBeDefined();
      expect(newTokens.refreshToken).toBeDefined();
      expect(newTokens.refreshToken).not.toBe(refreshTokenString);
    });

    it('should revoke old refresh token', async () => {
      await authService.refreshAccessToken(refreshTokenString);

      const oldToken = await RefreshToken.findOne({
        where: { token: refreshTokenString },
      });
      expect(oldToken?.isRevoked).toBe(true);
    });

    it('should throw error with invalid token', async () => {
      await expect(
        authService.refreshAccessToken('invalid-token')
      ).rejects.toThrow(AuthenticationError);
    });

    it('should throw error with revoked token', async () => {
      await authService.refreshAccessToken(refreshTokenString);

      await expect(
        authService.refreshAccessToken(refreshTokenString)
      ).rejects.toThrow(AuthenticationError);
    });
  });

  describe('logout', () => {
    let refreshTokenString: string;

    beforeEach(async () => {
      const result = await authService.register({
        email: 'test@example.com',
        password: 'Test@1234',
        role: UserRole.CUSTOMER,
      });
      refreshTokenString = result.tokens.refreshToken;
    });

    it('should revoke refresh token', async () => {
      await authService.logout(refreshTokenString);

      const token = await RefreshToken.findOne({
        where: { token: refreshTokenString },
      });
      expect(token?.isRevoked).toBe(true);
    });

    it('should not throw error if token does not exist', async () => {
      await expect(authService.logout('non-existent-token')).resolves.not.toThrow();
    });
  });
});
import request from 'supertest';
import app from '../../app';
import { User, RefreshToken } from '../../models';
import sequelize from '../../config/database';

describe('Auth API Integration Tests', () => {
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

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test@1234',
          role: 'CUSTOMER',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
    });

    it('should normalize email to lowercase', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'TEST@EXAMPLE.COM',
          password: 'Test@1234',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should fail with duplicate email', async () => {
      await request(app).post('/api/v1/auth/register').send({
        email: 'test@example.com',
        password: 'Test@1234',
      });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test@1234',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFLICT_ERROR');
    });

    it('should fail with weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'weak',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Test@1234',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send({
        email: 'test@example.com',
        password: 'Test@1234',
      });
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'test@example.com',
        password: 'Test@1234',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
    });

    it('should fail with incorrect password', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'test@example.com',
        password: 'WrongPassword@123',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'Test@1234',
      });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should lock account after max failed attempts', async () => {
      // Make 5 failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app).post('/api/v1/auth/login').send({
          email: 'test@example.com',
          password: 'WrongPassword@123',
        });
      }

      // 6th attempt should be locked
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'test@example.com',
        password: 'Test@1234',
      });

      expect(response.status).toBe(429);
      expect(response.body.error.code).toBe('RATE_LIMIT_ERROR');
      expect(response.body.error.message).toContain('Account locked');
    });

    it('should reset failed attempts on successful login', async () => {
      // Make 3 failed attempts
      for (let i = 0; i < 3; i++) {
        await request(app).post('/api/v1/auth/login').send({
          email: 'test@example.com',
          password: 'WrongPassword@123',
        });
      }

      // Successful login should reset counter
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'test@example.com',
        password: 'Test@1234',
      });

      expect(response.status).toBe(200);

      const user = await User.findOne({ where: { email: 'test@example.com' } });
      expect(user?.failedLoginAttempts).toBe(0);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const response = await request(app).post('/api/v1/auth/register').send({
        email: 'test@example.com',
        password: 'Test@1234',
      });
      refreshToken = response.body.data.tokens.refreshToken;
    });

    it('should refresh tokens successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
      expect(response.body.data.tokens.refreshToken).not.toBe(refreshToken);
    });

    it('should fail with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should fail with revoked refresh token (after use)', async () => {
      // Use the refresh token once
      await request(app).post('/api/v1/auth/refresh').send({ refreshToken });

      // Try to use it again (should fail due to rotation)
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const response = await request(app).post('/api/v1/auth/register').send({
        email: 'test@example.com',
        password: 'Test@1234',
      });
      refreshToken = response.body.data.tokens.refreshToken;
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should not allow using refresh token after logout', async () => {
      await request(app).post('/api/v1/auth/logout').send({ refreshToken });

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    let accessToken: string;

    beforeEach(async () => {
      const response = await request(app).post('/api/v1/auth/register').send({
        email: 'test@example.com',
        password: 'Test@1234',
      });
      accessToken = response.body.data.tokens.accessToken;
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should fail without token', async () => {
      const response = await request(app).get('/api/v1/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});
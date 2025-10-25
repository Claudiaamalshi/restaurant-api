import User from './User';
import RefreshToken from './RefreshToken';

// Export all models
export { User, RefreshToken };

// Sync all models (for development)
export const syncModels = async (force = false): Promise<void> => {
  await User.sync({ force });
  await RefreshToken.sync({ force });
  console.log('✓ All models synchronized');
};

export default {
  User,
  RefreshToken,
  syncModels,
};
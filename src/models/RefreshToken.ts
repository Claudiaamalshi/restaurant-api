import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface RefreshTokenAttributes {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RefreshTokenCreationAttributes
  extends Optional<RefreshTokenAttributes, 'id' | 'isRevoked'> {}

class RefreshToken
  extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes>
  implements RefreshTokenAttributes
{
  public id!: string;
  public userId!: string;
  public token!: string;
  public expiresAt!: Date;
  public isRevoked!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  public isValid(): boolean {
    return !this.isRevoked && !this.isExpired();
  }
}

RefreshToken.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    token: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isRevoked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'refresh_tokens',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id'],
      },
      {
        unique: true,
        fields: ['token'],
      },
      {
        fields: ['expires_at'],
      },
    ],
  }
);

// Associations
User.hasMany(RefreshToken, {
  foreignKey: 'userId',
  as: 'refreshTokens',
});

RefreshToken.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

export default RefreshToken;
// src/models/Restaurant.ts
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import { PriceRange } from '../types';

interface RestaurantAttributes {
  id: string;
  ownerId: string;
  name: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  openingHours?: object | null;
  cuisineType?: string | null;
  priceRange?: PriceRange | null;
  imageUrl?: string | null;
  logoUrl?: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

type RestaurantCreationAttributes = Optional<RestaurantAttributes, 'id' | 'isActive' | 'description' | 'address' | 'phone' | 'email' | 'openingHours' | 'cuisineType' | 'priceRange' | 'imageUrl' | 'logoUrl'>;

class Restaurant extends Model<RestaurantAttributes, RestaurantCreationAttributes> implements RestaurantAttributes {
  declare id: string;
  declare ownerId: string;
  declare name: string;
  declare description: string | null;
  declare address: string | null;
  declare phone: string | null;
  declare email: string | null;
  declare openingHours: object | null;
  declare cuisineType: string | null;
  declare priceRange: PriceRange | null;
  declare imageUrl: string | null;
  declare logoUrl: string | null;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Restaurant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: User, key: 'id' },
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(512),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: { isEmail: true },
    },
    openingHours: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    cuisineType: {
      type: DataTypes.STRING(128),
      allowNull: true,
    },
    priceRange: {
      type: DataTypes.ENUM('BUDGET', 'MODERATE', 'EXPENSIVE'),
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING(1024),
      allowNull: true,
    },
    logoUrl: {
      type: DataTypes.STRING(1024),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'restaurants',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['name'] },
      { fields: ['owner_id'] },
      { fields: ['is_active'] },
    ],
  }
);

export default Restaurant;

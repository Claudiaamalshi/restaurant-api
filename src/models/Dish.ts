// src/models/Dish.ts
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import Category from './Category';

interface DishAttributes {
  id: string;
  categoryId: string;
  name: string;
  description?: string | null;
  price: number;
  isAvailable: boolean;
  imageUrl?: string | null;
  averageRating: number;
  ratingCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type DishCreationAttributes = Optional<DishAttributes, 'id' | 'description' | 'isAvailable' | 'imageUrl' | 'averageRating' | 'ratingCount'>;

class Dish extends Model<DishAttributes, DishCreationAttributes> implements DishAttributes {
  declare id: string;
  declare categoryId: string;
  declare name: string;
  declare description: string | null;
  declare price: number;
  declare isAvailable: boolean;
  declare imageUrl: string | null;
  declare averageRating: number;
  declare ratingCount: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Dish.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Category, key: 'id' },
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
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    imageUrl: {
      type: DataTypes.STRING(1024),
      allowNull: true,
    },
    averageRating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    ratingCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'dishes',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['category_id'] },
      { fields: ['is_available'] },
    ],
  }
);

export default Dish;

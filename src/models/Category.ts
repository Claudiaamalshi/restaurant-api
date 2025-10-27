// src/models/Category.ts
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import Menu from './Menu';
import type Dish from './Dish';

interface CategoryAttributes {
  id: string;
  menuId: string;
  name: string;
  description?: string | null;
  displayOrder: number;
  isAvailable: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

type CategoryCreationAttributes = Optional<CategoryAttributes, 'id' | 'description' | 'displayOrder' | 'isAvailable'>;

class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  declare id: string;
  declare menuId: string;
  declare name: string;
  declare description: string | null;
  declare displayOrder: number;
  declare isAvailable: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare dishes?: Dish[];
}

Category.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    menuId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Menu, key: 'id' },
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
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'categories',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['menu_id'] }],
    defaultScope: {
      order: [['display_order', 'ASC']],
    },
  }
);

export default Category;

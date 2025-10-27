// src/models/Menu.ts
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import Restaurant from './Restaurant';
import type Category from './Category';

interface MenuAttributes {
  id: string;
  restaurantId: string;
  name: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type MenuCreationAttributes = Optional<MenuAttributes, 'id' | 'description'>;

class Menu extends Model<MenuAttributes, MenuCreationAttributes> implements MenuAttributes {
  declare id: string;
  declare restaurantId: string;
  declare name: string;
  declare description: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare categories?: Category[];
}

Menu.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, // ERD: one menu per restaurant
      references: { model: Restaurant, key: 'id' },
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
  },
  {
    sequelize,
    tableName: 'menus',
    timestamps: true,
    underscored: true,
    indexes: [{ fields: ['restaurant_id'] }],
  }
);

export default Menu;

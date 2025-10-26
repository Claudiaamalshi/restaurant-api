import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Restaurant from './Restaurant';
import { OrderStatus } from '../types';

export interface OrderAttributes {
  id: string;
  userId: string;
  restaurantId: string;
  status: OrderStatus;
  totalAmount: number;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type OrderCreationAttributes = Optional<
  OrderAttributes,
  'id' | 'status' | 'totalAmount' | 'notes'
>;

class Order
  extends Model<OrderAttributes, OrderCreationAttributes>
  implements OrderAttributes
{
  declare id: string;
  declare userId: string;
  declare restaurantId: string;
  declare status: OrderStatus;
  declare totalAmount: number;
  declare notes: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Helper method to check if order can be cancelled
  public canBeCancelled(): boolean {
    return ['PENDING', 'CONFIRMED'].includes(this.status);
  }

  // Helper method to check if order can be updated
  public canBeUpdated(): boolean {
    return this.status === 'PENDING';
  }
}

Order.init(
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
    restaurantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Restaurant,
        key: 'id',
      },
      onDelete: 'RESTRICT', // Don't allow deleting restaurant with orders
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      defaultValue: OrderStatus.PENDING,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: 0,
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'orders',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_orders_restaurant_status_created',
        fields: ['restaurant_id', 'status', 'created_at'],
      },
      {
        name: 'idx_orders_user_created',
        fields: ['user_id', 'created_at'],
      },
      {
        name: 'idx_orders_created_at',
        fields: ['created_at'],
      },
      {
        name: 'idx_orders_status',
        fields: ['status'],
      },
    ],
  }
);

export default Order;
import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import Order from './Order';
import Dish from './Dish';

export interface OrderItemAttributes {
  id: string;
  orderId: string;
  dishId: string;
  quantity: number;
  priceAtOrder: number;
  subtotal: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type OrderItemCreationAttributes = Optional<
  OrderItemAttributes,
  'id' | 'subtotal'
>;

class OrderItem
  extends Model<OrderItemAttributes, OrderItemCreationAttributes>
  implements OrderItemAttributes
{
  declare id: string;
  declare orderId: string;
  declare dishId: string;
  declare quantity: number;
  declare priceAtOrder: number;
  declare subtotal: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

OrderItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Order,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    dishId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Dish,
        key: 'id',
      },
      onDelete: 'RESTRICT', // Don't allow deleting dishes with orders
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        isInt: true,
      },
    },
    priceAtOrder: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Price snapshot at time of order',
      validate: {
        min: 0,
      },
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
  },
  {
    sequelize,
    tableName: 'order_items',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['order_id'],
      },
      {
        fields: ['dish_id'],
      },
    ],
    hooks: {
      beforeValidate: (orderItem: OrderItem) => {
        // Calculate subtotal automatically
        if (orderItem.quantity && orderItem.priceAtOrder) {
          orderItem.subtotal = orderItem.quantity * orderItem.priceAtOrder;
        }
      },
    },
  }
);

export default OrderItem;
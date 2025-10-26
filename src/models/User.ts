import { Model, DataTypes, Optional } from 'sequelize';
import bcrypt from 'bcrypt';
import sequelize from '../config/database';
import env from '../config/env';
import { UserRole } from '../types';

interface UserAttributes {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  failedLoginAttempts: number;
  lockoutUntil: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'failedLoginAttempts' | 'lockoutUntil'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare email: string;
  declare password: string;
  declare role: UserRole;
  declare failedLoginAttempts: number;
  declare lockoutUntil: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Instance methods
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  public isLockedOut(): boolean {
    if (!this.lockoutUntil) return false;
    return new Date() < this.lockoutUntil;
  }

  public async incrementFailedAttempts(): Promise<void> {
    this.failedLoginAttempts += 1;

    if (this.failedLoginAttempts >= env.MAX_LOGIN_ATTEMPTS) {
      const lockoutDuration = env.LOCKOUT_DURATION * 60 * 1000; // Convert minutes to ms
      this.lockoutUntil = new Date(Date.now() + lockoutDuration);
    }

    await this.save();
  }

  public async resetFailedAttempts(): Promise<void> {
    this.failedLoginAttempts = 0;
    this.lockoutUntil = null;
    await this.save();
  }

  // Remove password from JSON output
  public toJSON(): Partial<UserAttributes> {
    const { password: _password, ...values } = this.get() as UserAttributes;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
      set(value: string) {
        // Normalize email: lowercase and trim
        this.setDataValue('email', value.toLowerCase().trim());
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.CUSTOMER,
    },
    failedLoginAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    lockoutUntil: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['email'],
      },
    ],
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, env.BCRYPT_ROUNDS);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, env.BCRYPT_ROUNDS);
        }
      },
    },
  }
);

export default User;
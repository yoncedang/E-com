import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class shipping extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    shipping_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    fullname: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    district: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ward: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'USER',
        key: 'user_id'
      }
    },
    phone: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    areaCode: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: "+84"
    }
  }, {
    sequelize,
    tableName: 'shipping',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "shipping_id" },
        ]
      },
      {
        name: "user_id",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
  }
}

import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class payment_methods extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    payment_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    payment_name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    desc: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'payment_methods',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "payment_id" },
        ]
      },
    ]
  });
  }
}

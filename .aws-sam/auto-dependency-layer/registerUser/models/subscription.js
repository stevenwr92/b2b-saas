"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Subscription.belongsTo(models.SubscriptionType, { onDelete: "CASCADE" });
      Subscription.belongsTo(models.Tenant, { onDelete: "CASCADE" });
    }
  }
  Subscription.init(
    {
      start_date: {
        type: DataTypes.STRING,
      },
      end_date: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "Subscription",
    }
  );
  return Subscription;
};

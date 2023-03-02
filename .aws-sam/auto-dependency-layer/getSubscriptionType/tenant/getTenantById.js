const { loadSequelize } = require("../models/index");

let db = null;

exports.findByPk = async function (event, callback) {
  // re-use the sequelize instance across invocations to improve performance
  if (!db) {
    db = await loadSequelize("Tenant");
  } else {
    // restart connection pool to ensure connections are not re-used across invocations
    db.sequelize.connectionManager.initPools();

    // restore `getConnection()` if it has been overwritten by `close()`
    if (db.sequelize.connectionManager.hasOwnProperty("getConnection")) {
      delete db.sequelize.connectionManager.getConnection;
    }
  }

  try {
    let response;
    const { Tenant, TenantDetail, Subscription, SubscriptionTypeId } =
      db.sequelize.models;
    const id = event.pathParameters.id;
    let data = await Tenant.findByPk(id, {
      include: [TenantDetail, Subscription, SubscriptionTypeId],
    });
    if (!data) throw { error: "Tenant Not Exist" };
    response = {
      statusCode: 200,
      body: JSON.stringify(data),
    };

    return response;
  } catch (err) {
    response = {
      statusCode: 404,
      body: JSON.stringify(err),
    };
    return response;
  } finally {
    // close any opened connections during the invocation
    // this will wait for any in-progress queries to finish before closing the connections
    await db.sequelize.connectionManager.close();
  }
};

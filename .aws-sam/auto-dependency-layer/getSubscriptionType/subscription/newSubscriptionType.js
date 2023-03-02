const { loadSequelize } = require("../models/index");

let db = null;
let response;
exports.newSubscriptionType = async function (event, callback) {
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
    const { SubscriptionType } = db.sequelize.models;
    const body = JSON.parse(event.body);
    let bodySubscriptionType = {
      type: body.type,
      duration: body.duration,
      total_user: body.total_user,
      price: body.price,
      pages_allowed: body.pages_allowed,
    };

    let newSubscriptionType = await SubscriptionType.create(
      bodySubscriptionType
    );
    response = {
      statusCode: 200,
      body: JSON.stringify(
        `Success Added ${newSubscriptionType.type} Subscription to our System.`
      ),
    };
    return response;
  } catch (err) {
    console.log(err);
    response = {
      statusCode: 400,
      body: JSON.stringify(err.errors[0].message),
    };
    return response;
  } finally {
    // close any opened connections during the invocation
    // this will wait for any in-progress queries to finish before closing the connections
    await db.sequelize.connectionManager.close();
  }
};

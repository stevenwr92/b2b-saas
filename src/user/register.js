const { loadSequelize } = require("../models/index");
const { v4: uuidv4 } = require("uuid");

let db = null;
let response;
exports.register = async function (event, callback) {
  // re-use the sequelize instance across invocations to improve performance
  if (!db) {
    const tenant = event.requestContext.authorizer.name
      .toLowerCase()
      .replace(" ", "_");
    db = await loadSequelize(`db_${tenant}`);
  } else {
    // restart connection pool to ensure connections are not re-used across invocations
    db.sequelize.connectionManager.initPools();

    // restore `getConnection()` if it has been overwritten by `close()`
    if (db.sequelize.connectionManager.hasOwnProperty("getConnection")) {
      delete db.sequelize.connectionManager.getConnection;
    }
  }
  try {
    const { User } = db.sequelize.models;
    const id = +event.requestContext.authorizer.principalId;
    const body = JSON.parse(event.body);
    let bodyUser = {
      username: body.username,
      email: body.email,
      password: body.password,
      phonenumber: body.phonenumber,
      access_pin: body.access_pin,
      TenantId: id,
    };
    console.log(bodyUser);
    let newUser = await User.create(bodyUser);

    response = {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
      },
      body: JSON.stringify(`Success Added ${newUser.username} to your System.`),
    };
    return response;
  } catch (err) {
    console.log(err);
    response = {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
      },
      body: JSON.stringify(err.errors[0].message),
    };
    return response;
  } finally {
    // close any opened connections during the invocation
    // this will wait for any in-progress queries to finish before closing the connections
    await db.sequelize.connectionManager.close();
  }
};

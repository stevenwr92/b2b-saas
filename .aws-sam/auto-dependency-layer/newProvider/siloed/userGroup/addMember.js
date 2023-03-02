const { loadSequelizeSiloed } = require("../../modelssiloed/index");

let db = null;
let response;
exports.addMember = async function (event, callback) {
  // re-use the sequelize instance across invocations to improve performance
  if (!db) {
    const tenant = event.requestContext.authorizer.name
      .toLowerCase()
      .replace(" ", "-");
    db = await loadSequelizeSiloed(tenant);
  } else {
    // restart connection pool to ensure connections are not re-used across invocations
    db.sequelize.connectionManager.initPools();

    // restore `getConnection()` if it has been overwritten by `close()`
    if (db.sequelize.connectionManager.hasOwnProperty("getConnection")) {
      delete db.sequelize.connectionManager.getConnection;
    }
  }
  try {
    const { Group, User } = db.sequelize.models;
    const body = JSON.parse(event.body);

    let newMember = await User.update(
      { GroupId: 2 },
      {
        where: {
          id: 1,
        },
      }
    );
    console.log(newMember);
    response = {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
      },
      body: JSON.stringify(`Success.`),
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

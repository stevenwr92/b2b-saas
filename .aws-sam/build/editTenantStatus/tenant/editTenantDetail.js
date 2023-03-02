const { loadSequelize } = require("../models/index");
const { v4: uuidv4 } = require("uuid");

let db = null;
let response;
exports.editTenant = async function (event, callback) {
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
    const { TenantDetail } = db.sequelize.models;
    const body = JSON.parse(event.body);
    const id = event.pathParameters.id;
    let bodyDetail = {
      company_name: body.company_name,
      country: body.country,
      industry: body.industry,
      company_size: body.company_size,
    };
    let tenantDetail = await TenantDetail.findByPk(id);
    if (!tenantDetail) throw { message: "Tenant not Found" };
    let editTenantDetail = await TenantDetail.update(bodyDetail, {
      where: { id },
    });

    response = {
      statusCode: 200,
      body: JSON.stringify(
        `Success Edit ${tenantDetail.company_name} detail in our System.`
      ),
    };
    return response;
  } catch (err) {
    console.log(err);
    response = {
      statusCode: 400,
      body: JSON.stringify(err),
    };
    return response;
  } finally {
    // close any opened connections during the invocation
    // this will wait for any in-progress queries to finish before closing the connections
    await db.sequelize.connectionManager.close();
  }
};

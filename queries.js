const Pool = require("pg").Pool,
  config = require("./config"),
  creds = config.credentials,
  pool = new Pool({
    user: creds.user,
    host: creds.host,
    database: creds.database,
    password: creds.password,
    port: creds.port,
    ssl: creds.ssl
  });

const createTable = (request, response) => {
  pool.query(
    "CREATE TABLE IF NOT EXISTS alerts(id UUID PRIMARY KEY, eventType TEXT,eventTimestamp INT,deliveryStatus TEXT,affectedActionId TEXT,cacheTime INT,globalAccount UUID,subAccount UUID,resourceGroup UUID,resourceType TEXT,resourceName TEXT,severity TEXT,category TEXT,subject TEXT,body TEXT,priority INT,region TEXT,regionType TEXT,sourceEventId UUID,status TEXT)",
    (error, results) => {
      if (error) {
        // throw error
        response.status(500).json(error);
      }
      response.status(200).json(results);
    }
  );
};

const deleteTable = (request, response) => {
  pool.query("DROP TABLE IF EXISTS alerts", (error, results) => {
    if (error) {
      // throw error
      response.status(500).json(error);
    }
    response.status(200).json(results);
  });
};

const createAlert = (request, response) => {
  const {
    id,
    eventType,
    eventTimestamp,
    deliveryStatus,
    affectedActionId,
    cacheTime,
    globalAccount,
    subAccount,
    resourceGroup,
    resourceType,
    resourceName,
    severity,
    category,
    subject,
    body,
    priority,
    region,
    regionType,
    sourceEventId,
    status
  } = request.body;
  var query = {
    text:
      "INSERT INTO alerts (id,eventType,eventTimestamp,deliveryStatus,affectedActionId,cacheTime,globalAccount,subAccount,resourceGroup,resourceType,resourceName,severity,category,subject,body,priority,region,regionType,sourceEventId,status) VALUES ($1, $2, $3,$4, $5, $6,$7, $8, $9,$10, $11, $12,$13, $14, $15,$16, $17, $18,$19, $20)",
    values: [
      id,
      eventType,
      eventTimestamp,
      deliveryStatus,
      affectedActionId,
      cacheTime,
      globalAccount,
      subAccount,
      resourceGroup,
      resourceType,
      resourceName,
      severity,
      category,
      subject,
      body,
      priority,
      region,
      regionType,
      sourceEventId,
      status
    ],
    rowMode: "array"
  };
  // query.values= [id, eventType, eventTimestamp, deliveryStatus, affectedActionId, cacheTime, globalAccount, subAccount, resourceGroup, resourceType, resourceName, severity, category, subject, body, priority, region, regionType, sourceEventId, status]

  // console.log(request["id"]);
  /*query = {
    text: 'INSERT INTO alerts (id,eventType,eventTimestamp,deliveryStatus,affectedActionId,cacheTime,globalAccount,subAccount,resourceGroup,resourceType,resourceName,severity,category,subject,body,priority,region,regionType,sourceEventId,status) VALUES ($1, $2, $3,$4, $5, $6,$7, $8, $9,$10, $11, $12,$13, $14, $15,$16, $17, $18,$19, $20)',
    // values: [id, eventType, eventTimestamp, deliveryStatus, affectedActionId, cacheTime, globalAccount, subAccount, resourceGroup, resourceType, resourceName, severity, category, subject, alert_body, priority, region, regionType, sourceEventId, status],
    rowMode: 'array',
  }*/
  console.log(query);
  pool.query(query, (error, results) => {
    if (error) {
      // throw error
      console.log(error);
      response.status(500).json(error);
    }
    // console.log("results:"+JSON.parse(results));
    response.status(201).send(`Alert added with ID: ${id}`);
    console.log(results);
  });
};

const deleteAlert = (request, response) => {
  //const id = parseInt(request.params.id)
  const { id } = request.params;
  // console.log(request.params["id"]);
  pool.query("DELETE FROM alerts WHERE id = $1", [id], (error, results) => {
    if (error) {
      // throw error
      response.status(500).json(error);
    }
    response.status(200).send(`Alert deleted with ID: ${id}`);
  });
};

const getAllAlerts = (request, response) => {
  console.log(pool);

  pool.query("SELECT * FROM alerts ORDER BY id ASC", (error, results) => {
    if (error) {
      // throw error
      return response.status(500).json(error);
    }
    response.status(200).json(results.rows);
  });
};

const getAlert = (request, response) => {
  const { id } = request.params;
  console.log(id);
  pool.query("SELECT * FROM alerts WHERE id = $1", [id], (error, results) => {
    if (error) {
      // throw error
      response.status(500).json(error);
    }
    response.status(200).json(results.rows);
  });
};

const query = (request, response) => {
  // const {id} = request.params;
  const query = request.body;
  console.log(query);
  const query_updated = {
    text: query.text,
    values: [query.values.id]
  };
  console.log(query_updated);
  pool.query(query_updated, (error, results) => {
    if (error) {
      // throw error
      response.status(500).json(error);
    }
    console.log(results);
    response.status(200).json(results.rows);
  });
};

const pushAlerts = (request, response) => {
  // const {id} = request.params;
  const query = request.body;
  console.log(query);
  pool.query(query, (error, results) => {
    if (error) {
      // throw error
      response.status(500).json(error);
    }
    response.status(200).json(results.rows);
  });
};

const createBulkAlerts = async (request, response) => {
  var msg_array = [];
  const oauth_token_options = {
    method: "POST",
    url: creds.oauth_token.uri,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + creds.oauth_token.pwd
    }
  };
  console.log(oauth_token_options);
  const oauth_token = await config.apicall(oauth_token_options);
  // console.log(JSON.parse(oauth_token).access_token)
  if (oauth_token) {
    console.log(config.credentials.ans);
    config.credentials.ans.pwd = JSON.parse(oauth_token).access_token;
    const update_options = {
      method: "GET",
      url: config.credentials.ans.uri,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + config.credentials.ans.pwd
      }
    };
    // console.log(update_options)
    const data = await config.apicall(update_options);
    const alerts = JSON.parse(data);
    // console.log(JSON.parse(data).results[0].tags)
    alerts.results.forEach(body => {
      var msg = bulkAlerts({
        id: body.id,
        eventType: body.eventType,
        eventTimestamp: body.eventTimestamp,
        deliveryStatus: body.metadata.deliveryStatus,
        affectedActionId: body.metadata.affectedActionId,
        cacheTime: body.metadata.cacheTime,
        globalAccount: body.resource.globalAccount,
        subAccount: body.resource.subAccount,
        resourceGroup: body.resource.resourceGroup,
        resourceType: body.resource.resourceType,
        resourceName: body.resource.resourceName,
        severity: body.severity,
        category: body.category,
        subject: body.subject,
        alert_body: body.body,
        priority: body.priority,
        region: body.region,
        regionType: body.regionType,
        sourceEventId: body.tags[Object.keys(body.tags)[0]],
        status: body.tags[Object.keys(body.tags)[1]]
      });
      console.log(msg);
      msg_array.push(msg);
      console.log(msg_array);
    });
  }
  response.json(msg_array);
};

const alter = (request, response) => {
  pool.query(
    "ALTER TABLE alerts ALTER COLUMN sourceeventid TYPE VARCHAR",
    (error, results) => {
      if (error) {
        // throw error
        response.status(500).json(error);
      }
      response.status(200).json(results.rows);
    }
  );
};

const bulkAlerts = async request => {
  const {
    id,
    eventType,
    eventTimestamp,
    deliveryStatus,
    affectedActionId,
    cacheTime,
    globalAccount,
    subAccount,
    resourceGroup,
    resourceType,
    resourceName,
    severity,
    category,
    subject,
    alert_body,
    priority,
    region,
    regionType,
    sourceEventId,
    status
  } = request;
  // query.values= [request.id, request.eventType, request.eventTimestamp, request.deliveryStatus, request.affectedActionId, request.cacheTime, request.globalAccount, request.subAccount, request.resourceGroup, request.resourceType, request.resourceName, request.severity, request.category, request.subject, request.alert_body, request.priority, request.region, request.regionType, request.sourceEventId, request.status]
  var query = {
    text:
      "INSERT INTO alerts (id,eventType,eventTimestamp,deliveryStatus,affectedActionId,cacheTime,globalAccount,subAccount,resourceGroup,resourceType,resourceName,severity,category,subject,body,priority,region,regionType,sourceEventId,status) VALUES ($1, $2, $3,$4, $5, $6,$7, $8, $9,$10, $11, $12,$13, $14, $15,$16, $17, $18,$19, $20)",
    // values: [id, eventType, eventTimestamp, deliveryStatus, affectedActionId, cacheTime, globalAccount, subAccount, resourceGroup, resourceType, resourceName, severity, category, subject, alert_body, priority, region, regionType, sourceEventId, status],
    values: [
      request.id,
      request.eventType,
      request.eventTimestamp,
      request.deliveryStatus,
      request.affectedActionId,
      request.cacheTime,
      request.globalAccount,
      request.subAccount,
      request.resourceGroup,
      request.resourceType,
      request.resourceName,
      request.severity,
      request.category,
      request.subject,
      request.alert_body,
      request.priority,
      request.region,
      request.regionType,
      request.sourceEventId,
      request.status
    ],
    rowMode: "array"
  };
  // const body=alert_body
  // console.log(request.id)

  var x = await pool.query(query, (error, results) => {
    if (error) {
      // throw error
      console.log(JSON.stringify(error));
      // return error
      // response.status(500).json(error)
    }
    // console.log("results:"+JSON.parse(results));
    // response.status(201).send(`Alert added with ID: ${id}`)
    console.log(JSON.stringify(results));
    // return results
  });
  return x;

  /*var err = new Promise((resolve, reject) => {
                     await pool.query(query, (error, results) => {
    if (error) {
      // throw error
      // console.log(JSON.stringify(error))
       reject(error)
      // response.status(500).json(error)
    }
    // console.log("results:"+JSON.parse(results));
    // response.status(201).send(`Alert added with ID: ${id}`)
    // console.log(JSON.stringify(results))
    resolve(results)
  })
                });*/

  // console.log(err)
};

module.exports = {
  createTable,
  deleteTable,
  createAlert,
  deleteAlert,
  getAllAlerts,
  getAlert,
  pushAlerts,
  alter,
  query,
  createBulkAlerts
};

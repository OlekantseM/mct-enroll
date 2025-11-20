const sql = require('mssql');

module.exports = async function (context, req) {
  const email = req.body?.email;
  if (!email) {
    context.res = { status: 400, body: { message: 'Email is required' } };
    return;
  }

  // Use the connection string from Azure Static Web App configuration
  const connectionString = process.env.DB_CONNECTION_STRING;

  try {
    await sql.connect(connectionString);

    // Prevent duplicates
    await sql.query`IF NOT EXISTS (SELECT 1 FROM users WHERE email = ${email})
                    BEGIN
                      INSERT INTO users (email) VALUES (${email})
                    END`;

    context.res = { status: 200, body: { message: 'Email saved!' } };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { message: 'Database error' } };
  } finally {
    try { await sql.close(); } catch(e) {}
  }
};

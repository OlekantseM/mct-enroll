const sql = require('mssql');

module.exports = async function (context, req) {
  const email = req.body?.email;
  if (!email) {
    context.res = { status: 400, body: { message: 'Email is required' } };
    return;
  }

  const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: { encrypt: true } // required for Azure SQL
  };

  try {
    await sql.connect(config);
    // prevent duplicates (simple)
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

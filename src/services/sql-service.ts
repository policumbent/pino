import mariadb from 'mariadb';

// const host = process.env.DB_HOST

const host = 'vps.policumbent.it'
const database = 'policumbent'
const user = 'policumbent'
const password = 'RGn8D&g]5Rht(Kf6GBt86T'

const pool = mariadb.createPool({host, user, password, database, connectionLimit: 5});


async function query(sql: string): Promise<Array<object>> {
  let conn;
  let rows = []
  try {
    conn = await pool.getConnection();
    rows = await conn.query(sql);
    delete rows.meta;
    // rows: [ {val: 1}, meta: ... ]
  }
  catch(e) {
    // console.log(e);
    if (conn)
          conn.release(); //release to pool
  }
  finally {
    if (conn)
      conn.release(); //release to pool
  }
  return rows
}


export async function get_bikes(){
  return await query("SELECT * FROM bikes")
}

export async function upload(module: string, bike_id: number, data: Array<any>){
  let conn
  try {
    conn = await pool.getConnection();
  // todo: ma la security? e i controlli?
      for (const line of data) {
        // console.log(line);
        // console.log(Object.keys(line));
        const keys = Object.keys(line).concat('bike_id').join()
        let values = Object.values(line).concat(bike_id)
        values = values.map(v => `'${v}'`);
        const v = values.join()
        const sql = `INSERT INTO ${module}(${keys})
                     values (${v})`
        // console.log(sql)
        await conn.query(sql);
      }
  }
    catch(e) {
    // console.log(e);
    if (conn)
          conn.release(); //release to pool
  }
  finally {
    if (conn)
      conn.release(); //release to pool
  }
}

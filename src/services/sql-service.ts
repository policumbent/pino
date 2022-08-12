import mariadb, {SqlError} from 'mariadb';
import {AntData, GearData, GpsData} from '../utils'
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

export async function get_bikes_names(): Promise<Array<string>> {
  const res = await query("SELECT name FROM bikes ORDER BY id");
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return res.map(value => value.name)
}

export async function get_weather_stations(){
  return await query("SELECT * FROM weather_stations")
}

export async function get_devices(){
  return await query("SELECT * FROM devices")
}

export async function get_devices_names(): Promise<Array<string>> {
  const res = await query("SELECT name FROM devices ORDER BY id");
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return res.map(value => value.name)
}

// insert ant data into database from telemetry
export async function insert_ant_data_alice(data: AntData, bike: string){
  // find bike id
  const bikes = await get_bikes_names();
  const bike_id = (bikes.findIndex(value => value==bike))+1;
  // find device id
  const devices = await get_devices_names();
  const device_id = (devices.findIndex(value => value=='Alice'))+1;
  const timestamp = new Date(data.timestamp * 1000);

  let conn;
  try {
    conn = await pool.getConnection();
    const res = await conn.query("" +
      "INSERT INTO ant(timestamp, bike, device, speed, distance, cadence, power, heart_rate)" +
      " value (?, ?, ?, ?, ?, ?, ?, ?)",
      [timestamp, bike_id, device_id, data.speed, data.distance, data.cadence, data.power, data.heartrate]);
    console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    if (conn){
      conn.end();
    }
  }
}

// insert gps data into database from telemetry
export async function insert_gps_data_alice(data: GpsData, bike: string){
  // find bike id
  const bikes = await get_bikes_names();
  const bike_id = (bikes.findIndex(value => value==bike))+1;
  // find device id
  const devices = await get_devices_names();
  const device_id = (devices.findIndex(value => value=='Alice'))+1;
  const timestamp = new Date(data.timestamp * 1000);
  const timestampGps = new Date(data.timestampGPS);

  let conn;
  try {
    conn = await pool.getConnection();
    const res = await conn.query("" +
      "INSERT INTO gps(timestamp, bike, device, timestampGPS, speed, distance, latitude, longitude, altitude, satellites, distance2timing) " +
      " value (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [timestamp, bike_id, device_id, timestampGps, data.speed, data.distance, data.latitude, data.longitude, data.altitude, data.satellites, data.distance2timing]);
    console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    if (conn){
      conn.end();
    }
  }
}

// insert gear data into database from telemetry
export async function insert_gear_data_alice(data: GearData, bike: string){
  // find bike id
  const bikes = await get_bikes_names();
  const bike_id = (bikes.findIndex(value => value==bike))+1;
  // find device id
  const devices = await get_devices_names();
  const device_id = (devices.findIndex(value => value=='Alice'))+1;
  const timestamp = new Date(data.timestamp * 1000);

  let conn;
  try {
    conn = await pool.getConnection();
    const res = await conn.query("" +
      "INSERT INTO gear(timestamp, bike, device, gear) " +
      " value (?, ?, ?, ?)",
      [timestamp, bike_id, device_id, data.gear]);
    console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    if (conn){
      conn.end();
    }
  }
}

// insert ant weather data into database from remote weather station
export async function insert_weather_data_alice(){
  return {}
}

export async function upload(module: string, bike_id: number, data: Array<any>){
  let conn;
  let uploaded_lines = 0;
  console.log(data.length)
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
        try {
          await conn.query(sql);
          uploaded_lines++;
        }
        catch(e) {
          if(!(e instanceof SqlError)){
            throw e;
          }
        }
      }
  }
  catch(e) {
    if (conn)
          conn.release(); //release to pool
  }
  finally {
    if (conn)
      conn.release(); //release to pool
  }
  return uploaded_lines;
}

create table weather_stations(
  id smallint unsigned not null auto_increment comment 'WS id',
  description varchar(50)  not null UNIQUE comment 'Weather Station description',
  primary key (id)
);

create table bikes(
  id smallint unsigned not null auto_increment comment 'Bike id',
  name varchar(20)  not null UNIQUE comment 'Bike name',
  primary key (id)
);

create table devices(
  id smallint unsigned not null auto_increment comment 'Device id',
  name varchar(20) not null UNIQUE comment 'Device description',
  primary key (id)
);
create table ant
(
  timestamp  datetime not null,
  bike       smallint unsigned not null comment 'Bike id',
  device     smallint unsigned not null comment 'Device ID (Garmin/Alice/Local DB)',
  speed      float    not null comment 'Unit: km/h',
  distance   int      not null comment 'Unit: m',
  cadence    tinyint unsigned  not null comment 'Unit: rpm',
  power      smallint unsigned not null comment 'Unit: W',
  heart_rate tinyint unsigned  not null comment 'Unit: bpm',
  primary key (timestamp, bike, device),
  foreign key (bike) references bikes (id),
  foreign key (device) references devices (id)
);

create table accelerometer
(
  timestamp  datetime not null,
  bike       smallint unsigned not null comment 'Bike id',
  device     smallint unsigned not null comment 'Device ID (Garmin/Alice/Local DB)',
  acc_x      float    not null comment 'Unit: m/s^2',
  acc_y      float    not null comment 'Unit: m/s^2',
  acc_z      float    not null comment 'Unit: m/s^2',
  gyr_x      float    not null comment 'Unit: °/s',
  gyr_y      float    not null comment 'Unit: °/s',
  gyr_z      float    not null comment 'Unit: °/s',
  primary key (timestamp, bike, device),
  foreign key (bike) references bikes (id),
  foreign key (device) references devices (id)
);

create table gear
(
  timestamp  datetime not null,
  bike       smallint unsigned not null comment 'Bike id',
  device     smallint unsigned not null comment 'Device ID (Garmin/Alice/Local DB)',
  gear      tinyint unsigned    not null comment 'Unit: []',
  primary key (timestamp, bike, device),
  foreign key (bike) references bikes (id),
  foreign key (device) references devices (id)
);

create table gps
(
  timestamp     datetime not null,
  bike          smallint unsigned not null comment 'Bike id',
  device        smallint unsigned not null comment 'Device ID (Garmin/Alice/Local DB)',
  timestampGPS  datetime not null,
  speed      float    not null comment 'Unit: km/h',
  distance   int      not null comment 'Unit: m',
  latitude float not null comment 'Unit: °',
  longitude float not null comment 'Unit: °',
  altitude float    not null comment 'Unit: m',
  satellites    tinyint unsigned  not null comment 'Unit: []',
  distance2timing      float    not null comment 'Unit: m',
  primary key (timestamp, bike, device),
  foreign key (bike) references bikes (id),
  foreign key (device) references devices (id)
);

create table weather
(
  timestamp     datetime not null,
  ws_id          smallint unsigned not null comment 'WS id',
  device        smallint unsigned not null comment 'Device ID (WS/by hand)',
  wind_speed     float    not null comment 'Unit: m/s',
  wind_direction float    not null comment 'Unit: °',
  temperature float    not null comment 'Unit: °C',
  pressure      float    not null comment 'Unit: ?',
  primary key (timestamp, ws_id, device),
  foreign key (ws_id) references weather_stations(id),
  foreign key (device) references devices (id)
);



insert into bikes (name) values ('Taurus');
insert into bikes (name) values ('TaurusX');
insert into bikes (name) values ('Phoenix');
insert into bikes (name) values ('Cerberus');

insert into weather_stations (description) values ('La nostra unica stazione meteo (per ora');

insert into devices (name) values ('Alice');
insert into devices (name) values ('Garmin');
insert into devices (name) values ('LocalDB');

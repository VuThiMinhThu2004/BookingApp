create database bookingapp;
use bookingapp;
-- TABLES

-- we do not concern about the info of admin so we don't need admin table 
CREATE TABLE account (
  id int AUTO_INCREMENT primary key,
  email nvarchar(255) not null,
  password varchar(255) not null,
  type_of_account ENUM ('booker', 'admin') default 'booker' -- the admin account is only can be created in the sql server;
);

CREATE TABLE rating (
  id_rating int AUTO_INCREMENT,
  rating int,
  PRIMARY KEY (id_rating)
);

CREATE TABLE rating2 (
  id_rating int AUTO_INCREMENT,
  rating int,
  PRIMARY KEY (id_rating)
);

CREATE TABLE rating3 (
  id_rating int AUTO_INCREMENT,
  rating int,
  PRIMARY KEY (id_rating)
);

CREATE TABLE rating4 (
  id_rating int AUTO_INCREMENT,
  rating int,
  PRIMARY KEY (id_rating)
);

CREATE TABLE rating5 (
  id_rating int AUTO_INCREMENT,
  rating int,
  PRIMARY KEY (id_rating)
);

CREATE TABLE rating6 (
  id_rating int AUTO_INCREMENT,
  rating int,
  PRIMARY KEY (id_rating)
);

CREATE TABLE type (
	id int PRIMARY KEY auto_increment,
	name varchar(255),
	capacity int,
	description TEXT,
	link VARCHAR(255),
	image VARCHAR(255),
  FULLTEXT(description)
);

CREATE TABLE room (
  id int PRIMARY KEY auto_increment,
  number int,
  type_id int, -- referencing to type table
  CONSTRAINT FK_TypeID FOREIGN KEY (type_id) references type(id)
);

CREATE TABLE booker (
  id int, -- the id is referencing to id in account
  first_name varchar(50) not null,
  last_name varchar(50) not null,
  birth_date date,
  phone char(10) not null,
  PRIMARY KEY (id),
  CONSTRAINT FK_BookerID FOREIGN KEY (id) references account(id)
);
CREATE TABLE reservation (
  id int PRIMARY KEY auto_increment,
  date_in date,
  date_out date,
  booker_id int,
  status enum('accept','decline','pending','checkin','checkout') default 'pending', 
  CONSTRAINT FK_rever_bookerid FOREIGN KEY (booker_id) references booker(id)
);

CREATE TABLE room_reserved (
  reservation_id int,
  room_id int,
  PRIMARY KEY (reservation_id, room_id),
  CONSTRAINT FK_room_reserverd_room_id FOREIGN KEY (room_id) references room(id),
  CONSTRAINT FK_room_reserverd_reservation_id FOREIGN KEY (reservation_id) references reservation(id)
);

-- this table is to update price for each month and year
CREATE TABLE month_price (
  type_id int,
  month int,
  year int,
  price_each_day int,
  PRIMARY KEY (type_id, month, year),
  CONSTRAINT FK_month_price_type_id FOREIGN KEY (type_id) references type(id)
);

CREATE TABLE payment (
  payment_id int PRIMARY KEY auto_increment,
  payment_date date default '1990-01-01', -- if the payment day is default value mean user haven't paid
  reservation_id int,
  total_price int,
  CONSTRAINT FK_payment_reservation_id FOREIGN KEY (reservation_id) references reservation(id)
);
-- facilities table
CREATE TABLE IF NOT EXISTS bookingapp.`facilities` (
  room_id INT NOT NULL PRIMARY KEY,
  desciption VARCHAR(100) NOT NULL,
  CONSTRAINT room_id_fk
    FOREIGN KEY (room_id)
    REFERENCES room(id))
ENGINE = InnoDB
AUTO_INCREMENT = 249
DEFAULT CHARACTER SET = utf8mb4;

-- INDEXS

create index email_idx on account(email);
-- for further improvement of app we can add some other index to improve running speed

-- SOME EVENT OR TRIGGER OR PROCEDURE OR FUNCTION
SET GLOBAL log_bin_trust_function_creators = 1;

DELIMITER $$
CREATE FUNCTION calculatePrice(input_type_id int, arrivalDate DATE, departureDate DATE)
RETURNS DECIMAL(10,2)
BEGIN
    DECLARE totalPrice DECIMAL(10,2) DEFAULT 0;
    DECLARE currentDate DATE DEFAULT arrivalDate;

    WHILE currentDate < departureDate DO
        SET @currentMonth = MONTH(currentDate);
        SET @currentYear = YEAR(currentDate);

        SELECT price_each_day INTO @price
        FROM month_price
        WHERE type_id = input_type_id AND month = @currentMonth AND year = @currentYear
        limit 1;

        IF @price IS NOT NULL THEN
            SET totalPrice = totalPrice + @price;
        END IF;

        SET currentDate = ADDDATE(currentDate, INTERVAL 1 DAY);
    END WHILE;

    RETURN totalPrice;
END$$
DELIMITER ;

-- this trigger is to update the date_out of reservation and payment when guest want to checkout early
delimiter //
create trigger early_checkout
before update
on reservation
for each row
begin
if new.status = 'checkout' and old.date_out != curdate()
then
set new.date_out = curdate();
update payment
set total_price = (select sum(calculatePrice(r.type_id,old.date_in,curdate()))
from reservation as re,room as r,room_reserved as rr
where re.id = rr.reservation_id and rr.room_id = r.id and re.id = old.id)
where reservation_id = old.id;
end if;
end//
DELIMITER ;
-- this event to auto decline the reservation when pass the date_in day
CREATE EVENT update_status_event
ON SCHEDULE EVERY 1 DAY
DO

    UPDATE reservation
    SET status = 'decline'
    WHERE status = 'accept' AND date_in < curdate();
    
-- VIEWS

-- these view can be applied for many future feature of the app

create view vReservation as
select re.id,b.id as booker_id,concat(b.first_name,' ',b.last_name) as name,b.phone,re.date_in,re.date_out,room.number,re.status,total_price,payment_date 
from reservation as re, booker as b,payment as p,room_reserved as r, room
where b.id = re.booker_id and re.id=p.reservation_id and r.reservation_id = re.id and room.id = r.room_id;

create view vDashboard as
select re.id,b.id as booker_id,concat(b.first_name,' ',b.last_name) as name,b.phone,re.date_in,re.date_out,room.number,re.status,total_price,payment_date 
from reservation as re, booker as b,payment as p,room_reserved as r, room
where b.id = re.booker_id and re.id=p.reservation_id and r.reservation_id = re.id and room.id = r.room_id and re.status = 'pending';
    
create view vroomlist as
select room.id, room.number, room.type_id, 
	   if(r.status is null, "available", r.status) as status, 
       if(first_name is null, '', concat(last_name, ' ', first_name)) as booker
from room
left join room_reserved rr on room.id = rr.room_id
left join reservation r on rr.reservation_id = r.id
left join booker on r.booker_id = booker.id;
-- INSERT SOME NECESSARY FOR THE APP
    
insert into type(name,capacity, description, link, image)
values 
('single',1,'A spacious sigle room which has large single bed, locates between the 4th and 13rd floor 
                                with sweeping view overlooking the vibrant city.','/detail1', 'images/room-1.jpg'),
('double',2,'Providing an average of 34sqm of comfortable living space, 
                                the Luxury Double Room offers a perfect blend of classical elegance','/detail2','images/room-2.jpg'),
('triple',3,'Located on upper level with panoramic view of Ho Guom, 
                                the Standard One Person Room is the perfect retreat to leave behind the hassle of daily life and experience.','/detail3','images/room-3.jpg'),
('quad',4,'Spacious in size and elegant in style, the Deluxe Quad Suite features a living room, 
                                an airy bedroom and a comfortable working area for greater privacy.','/detail4','images/room-4.jpg'),
('president',2,'Embodies the elegance that defines our luxury hotel, 
                                the President Suites are beautifully decorated in elegant tones that create a distinctive atmosphere.','/detail5','images/room-5.jpg'),
('rooftop',2,'Nestled on the top floor, the Rooftop Suite provides an ingenious blend of luxury and private living, 
                                featuring the full range of first class hotel services.','/detail6','images/room-6.jpg');
      
insert into room (number,type_id)
values 
(201,1),
(202,1),
(203,2),
(204,3),
(205,3),
(206,1),
(207,4),
(208,2),
(209,1),
(301,1),
(302,1),
(303,2),
(304,3),
(305,3),
(306,1),
(307,4),
(308,2),
(309,1),
(401,1),
(402,1),
(403,2),
(404,3),
(405,3),
(406,1),
(407,4),
(408,2),
(409,1),
(501,1),
(502,1),
(503,2),
(504,3),
(505,3),
(506,1),
(507,4),
(508,2),
(509,5),
(601,1),
(602,1),
(603,2),
(604,3),
(605,3),
(606,1),
(607,4),
(608,2),
(609,5),
(701,1),
(702,1),
(703,2),
(704,3),
(705,3),
(706,1),
(707,4),
(708,2),
(709,5),
(801,1),
(802,1),
(803,2),
(804,3),
(805,3),
(806,1),
(807,4),
(808,2),
(809,5),
(901,1),
(902,6),
(903,2),
(904,3),
(905,6);

insert into month_price(type_id,month,year,price_each_day)
values 
(1,1,2024,100),
(2,1,2024,150),
(3,1,2024,200),
(4,1,2024,250),
(5,1,2024,400),
(6,1,2024,350),
(1,2,2024,100),
(2,2,2024,150),
(3,2,2024,200),
(4,2,2024,250),
(5,2,2024,400),
(6,2,2024,350),
(1,3,2024,100),
(2,3,2024,150),
(3,3,2024,200),
(4,3,2024,250),
(5,3,2024,400),
(6,3,2024,350),
(1,4,2024,200),
(2,4,2024,300),
(3,4,2024,400),
(4,4,2024,500),
(5,4,2024,800),
(6,4,2024,700),
(1,5,2024,100),
(2,5,2024,150),
(3,5,2024,200),
(4,5,2024,250),
(5,5,2024,400),
(6,5,2024,350),
(1,6,2024,100),
(2,6,2024,150),
(3,6,2024,200),
(4,6,2024,250),
(5,6,2024,400),
(6,6,2024,350),
(1,7,2024,100),
(2,7,2024,150),
(3,7,2024,200),
(4,7,2024,250),
(5,7,2024,400),
(6,7,2024,350),
(1,8,2024,100),
(2,8,2024,150),
(3,8,2024,200),
(4,8,2024,250),
(5,8,2024,400),
(6,8,2024,350),
(1,9,2024,100),
(2,9,2024,150),
(3,9,2024,200),
(4,9,2024,250),
(5,9,2024,400),
(6,9,2024,350),
(1,10,2024,100),
(2,10,2024,150),
(3,10,2024,200),
(4,10,2024,250),
(5,10,2024,400),
(6,10,2024,350),
(1,11,2024,100),
(2,11,2024,150),
(3,11,2024,200),
(4,11,2024,250),
(5,11,2024,400),
(6,11,2024,350),
(1,12,2024,100),
(2,12,2024,150),
(3,12,2024,200),
(4,12,2024,250),
(5,12,2024,400),
(6,12,2024,350);

insert into account(email,password,type_of_account)
values ('admin@test.com','admin','admin');
### Technical Specifications
* Frontend: EJS, CSS, Javascript
* Backend: ExpressJS, NodeJS
* Database: MySQL, MongoDB, Redis

### Features
- Authentication: Login, signup, resetPassword, updatePassword
- Authorization:
  - Restrict users, admin, guides what they can do
- Admin:
  - An admin account is provided
  - Create, read, update the booking status
  - Search booking information 
  - Checkin - checkout
  - Chat
- Users:
  - Update user information
  - Review room types and prices
  - Booking validation
  - Recommend the rooms number for each chosen room type 
  - Bill displaying
  - Chat

### Configure Replication for MySQL
1. Open MySQL Command Line Client
2. Setup Master Server:
   ```
    SET GLOBAL server_id = 1;
    CREATE USER 'replication_user'@'localhost' IDENTIFIED BY 'password'; 
    GRANT REPLICATION SLAVE ON *.* TO 'replication_user'@'localhost';
    FLUSH PRIVILEGES;
    SHOW MASTER STATUS; // note the Log File and Log Position for next steps;
   ```

4. Setup Slave Server:
   ```
    SET GLOBAL server_id = 2;
    STOP SLAVE; 
    CHANGE MASTER TO MASTER_HOST='localhost', MASTER_USER='replication_user', MASTER_PASSWORD='password', MASTER_LOG_FILE='current_log_file', MASTER_LOG_POS=current_log_position;
    START SLAVE;
    SHOW SLAVE STATUS\G;  // check if the replication has been started
    SHOW DATABASES;
  ```
## Setup
1. Press the **Fork** button (top right the page) to save copy of this project on your account.
2. Download the repository files (project) from the download section or clone this project to your local machine by typing in the bash the following command:

      git clone https://github.com/khuatbaonguyen123/HotelBooking.git
3. Install some essential libraries: `npm install`
4. Import & execute the SQL queries from the Database folder to the MySQL database.
5. Import the project in any IDE that support the aforementioned programming languages.
6. Deploy & Run the application with `npm run dev` :D

## Project Structure
    ├── bookingapp_query    # tables and queries used for this project
    |   └── bookingapp.jpg
    |   └── bookingapp.sql
    ├── pages               #ejs files
    ├── public              
    ├── routes              #code files
    |   └── admin.js
    |   └── booking.js
    |   └── general.js
    |   └── users.js    
    ├── .env
    ├── .gitignore
    ├── README.md
    ├── database.js
    ├── HBWpresentSlide.pdf
    ├── index.js
    ├── package-lock.json
    └── package.json

## Collaborators

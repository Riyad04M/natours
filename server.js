const dotenv = require('dotenv');
const mongoose = require('mongoose');
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception! 😭 shutting down...');
  console.log(err.name, err.message);
  console.log(err.stack);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');
// console.log(process);
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    // useFindAndModify: false,
    useFindAndModify: true,
    autoIndex: true,
   
  })
  .then((con) => {
    // console.log(con.connection);
    console.log(`connected to db`);
  });

const server = app.listen(process.env.PORT, () => {
  console.log('listening to port 3000...');
});  

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection! 😭 shutting down...');
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});

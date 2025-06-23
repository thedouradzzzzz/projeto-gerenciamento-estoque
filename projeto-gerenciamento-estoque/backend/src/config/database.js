const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(MongoDB Conectado:  + conn.connection.host);
  } catch (error) {
    console.error(Erro ao conectar com o MongoDB:  + error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

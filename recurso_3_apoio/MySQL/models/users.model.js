module.exports = (sequelize, DataTypes) => {
   const user = sequelize.define('user', {
      name: {
         type: DataTypes.STRING
      },
      email: {
         type: DataTypes.STRING
      },
      password: {
         type: DataTypes.STRING
      },
      role: {
         type: DataTypes.ENUM('student', 'teacher')
      },
   }, {
      timestamps: false // Do not add createdAt and updatedAt fields
   });

   return user;
}
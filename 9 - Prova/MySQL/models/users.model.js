module.exports = (sequelize, DataTypes) => {
   const User = sequelize.define('User', {
      username: {
         type: DataTypes.STRING,
         // validate unique username (indicate value)
         unique: {
            args: true,
            msg: 'Username already exists'
         },
         allowNull: false
      },
      password: {
         type: DataTypes.STRING,
         allowNull: false
      },
      role: {
         type: DataTypes.ENUM('admin', 'editor'),
         allowNull: false,
         //add enum validation
         validate: {
            isIn: {
               args: [['admin', 'editor']],
               msg: "Role must be one of the following: admin or editor"
            }
         }
      },
   }, {
      timestamps: false // Do not add createdAt and updatedAt fields
   });

   return User;
}
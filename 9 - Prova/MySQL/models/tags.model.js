// tags.model.js
module.exports = (sequelize, DataTypes) => {
   const Tag = sequelize.define("Tag", {
       id: {
           type: DataTypes.INTEGER,
           autoIncrement: true,
           primaryKey: true
       },
       name: {
           type: DataTypes.STRING,
           allowNull: false,
           unique: true
       }
   }, {
       timestamps: false
   });
   return Tag;
};

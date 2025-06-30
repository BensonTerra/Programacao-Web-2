module.exports = (sequelize, DataTypes) => {
   const Tag = sequelize.define("Tag", {
       name: {
           primaryKey: true,
           type: DataTypes.STRING,
       }
   }, {
       timestamps: false
   });
   return Tag;
};
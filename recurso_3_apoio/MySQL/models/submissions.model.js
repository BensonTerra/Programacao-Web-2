module.exports = (sequelize, DataTypes) => {
   const submission = sequelize.define('submission', {
    project: {
      type: DataTypes.STRING,
      references: {
        model: "Projects",
        key: "id", 
      },
    },
    submittedBy: {
      type: DataTypes.STRING,
      references: {
        model: "Users",
        key: "id", 
      },
    },
    submittedAt: {
      type: DataTypes.DATEONLY,
    },
   }, {
      timestamps: false // Do not add createdAt and updatedAt fields
   });

   return submission;
}
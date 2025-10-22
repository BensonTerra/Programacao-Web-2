module.exports = (sequelize, DataTypes) => {
  const project = sequelize.define("project", {
	title: {
        type: DataTypes.STRING,
      },
      author: {
        type: DataTypes.STRING,
        references: {
            model: "users",
            key: "id", 
        }
      },
	supervisor: {
        type: DataTypes.STRING,
        references: {
            model: "users",
            key: "id", 
        },
      },
	deadline: {
    type: DataTypes.DATE,
	},
	status: {
		type: DataTypes.ENUM('pending','approved','submitted','graded','expired'),
		validate: {
			isIn: {
				args: [['pending','approved','submitted','graded','expired']]
			}}
    }
  }, 
  {
    timestamps: false, // Do not add createdAt and updatedAt fields
  });
  return project;
};

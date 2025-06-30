module.exports = (sequelize, DataTypes) => {
   const Post = sequelize.define('Post', {
      title: {
         type: DataTypes.STRING,
         allowNull: false,
         validate: {
            len: { args: [5, 50], msg: "Title must have between 5 to 50 characters."}
         }
      },
      description: {
         type: DataTypes.TEXT,
         allowNull: false
      },
      published: {
         type: DataTypes.BOOLEAN,
         defaultValue: false,
         // validate if is boolean
         validate: {
            isBoolean: function(value) {
               if (typeof value !== 'boolean') {
                  throw new Error('Published must be a boolean value.');
               }
            }
         }
      },
      views: {
         type: DataTypes.INTEGER.UNSIGNED,
         defaultValue: 0,
         validate: {
            min: {
               args: [0],
               msg: "Views must be a non-negative integer."
            }
         }
      },
      publishedAt: {
         type: DataTypes.DATE,
         defaultValue: DataTypes.NOW
      }
   }, {
      timestamps: false // Do not add createdAt and updatedAt fields
   });

   return Post;
}
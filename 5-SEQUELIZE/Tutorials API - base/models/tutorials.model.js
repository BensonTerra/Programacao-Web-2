module.exports = (sequelize, DataTypes) => {
    const Tutorial = sequelize.define("Tutorial", {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notNull: { msg: "Title can not be empty or null!" } }
        },
        description: {
            type: DataTypes.STRING
        },
        published: {
            type: DataTypes.BOOLEAN,
            defaultValue: 0,
            validate: {
                // custom validation function 
                isBoolean: function (val) {
                    if (typeof (val) != 'boolean')
                        throw new Error('Published must contain a boolean value!');
                }
            }
        }
    }, {
        timestamps: false
    });
    return Tutorial;
};
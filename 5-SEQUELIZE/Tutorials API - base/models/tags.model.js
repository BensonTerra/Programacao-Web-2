module.exports = (sequelize, DataTypes) => {
    const Tag = sequelize.define('Tag', {
        name: {
            type: DataTypes.STRING,
            primaryKey: true
        }
    }, {timestamps: false});
    return Tag
}
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    fbId: DataTypes.STRING,
    botState: DataTypes.JSONB,
    avatar: DataTypes.STRING,
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.user.hasMany(models.interactions);
      },
    },
  });
  return User;
};

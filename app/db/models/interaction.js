module.exports = (sequelize, DataTypes) => {
  const Interaction = sequelize.define('Interaction', {
    userId: DataTypes.INTEGER,
    direction: 'smallint',
    content: DataTypes.JSONB,
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.integration.belongsTo(models.user);
      },
    },
  });
  return Interaction;
};

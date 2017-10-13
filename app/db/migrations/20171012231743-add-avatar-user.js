module.exports = {
  up: (queryInterface, Sequelize) => (
    queryInterface.addColumn(
      'Users',
      'avatar',
      {
        type: Sequelize.STRING,
      },
    )
  ),
  down: queryInterface => queryInterface.removeColumn('Users', 'avatar'),
};

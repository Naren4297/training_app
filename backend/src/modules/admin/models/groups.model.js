module.exports = (sequelize, DataTypes) => {
    const groups = sequelize.define("groups", {
      group_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      users: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true
      },
      createdBy: {
        type: DataTypes.STRING,
        allowNull: true 
      },
      modifiedBy: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      updatedBy: {
        type: DataTypes.STRING,
        allowNull: true
      }
    }, {
      tableName: 'groups',
      timestamps: true
    });

    const defaultGroups = [
      { group_name: 'admin', users: [], createdBy: 'System', updatedBy: 'System' },
      { group_name: 'co-ordinator', users: [], createdBy: 'System', updatedBy: 'System' },
      { group_name: 'trainer', users: [], createdBy: 'System', updatedBy: 'System' },
      { group_name: 'trainee', users: [], createdBy: 'System', updatedBy: 'System' },
    ];
    
    // sequelize.sync({ force: true }).then(async () => {
    //   const count = await groups.count();
    //   if (count === 0) {
    //     await groups.bulkCreate(defaultGroups);
    //     console.log('Default groups have been added.');
    //   } else {
    //     console.log('Groups already exist.');
    //   }
    // }).catch(error => {
    //   console.error('Unable to sync the database:', error);
    // });

    return groups;
  };
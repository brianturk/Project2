module.exports = (sequelize, DataTypes) => {
  const Story = sequelize.define("Story", {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nextUserId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    totalCharacters: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100
    },
    totalTurns: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10
    },
    storyCompleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  });

  // Story.associate = models => {
  //   models.User.hasMany(models.Story);
  // };

  Story.associate = function(models) {
    models.Story.belongsTo(models.User, {
      onDelete: "CASCADE",
      foreignKey: "creatorId"
    });
  };

  Story.associate = function(models) {
    models.Story.belongsTo(models.User, {
      onDelete: "CASCADE",
      foreignKey: "nextUserId"
    });
  };

  // Story.associate = models => {
  //   Story.belongsToMany(models.User, {
  //     through: "Contributor",
  //     foreignKey: "storyId"
  //   });
  // };

  // Story.associate = models => {
  //   Story.belongsToMany(models.User, {
  //     through: "Paragraph",
  //     foreignKey: "storyId"
  //   });
  // };

  return Story;
};

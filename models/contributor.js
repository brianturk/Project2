module.exports = (sequelize, DataTypes) => {
  const Contributor = sequelize.define("Contributor", {
    storyId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    hasSignedUp: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    userOrderNum: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    left: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    archived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  });

  Contributor.associate = function(models) {
    models.Contributor.belongsTo(models.User, {
      onDelete: "CASCADE",
      foreignKey: "userId"
    });
  };

  Contributor.associate = function(models) {
    models.Contributor.belongsTo(models.Story, {
      onDelete: "CASCADE",
      foreignKey: "storyId"
    });
  };
  // Story.associate = models => {
  //   models.User.hasMany(models.Story);
  // };

  return Contributor;
};

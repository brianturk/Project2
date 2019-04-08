module.exports = (sequelize, DataTypes) => {
  const Contributor = sequelize.define("Contributor", {
    // storyId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false
    // },
    // userID: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false
    // },
    userEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    hasSignedUp: {
      type: DataTypes:BO
    }
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
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: false
    }
  });

  // Story.associate = models => {
  //   models.User.hasMany(models.Story);
  // };

  return Contributor;
};

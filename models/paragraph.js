module.exports = (sequelize, DataTypes) => {
  const Paragraph = sequelize.define("Paragraph", {
    storyId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  });

  Paragraph.associate = function(models) {
    models.Paragraph.belongsTo(models.User, {
      onDelete: "CASCADE",
      foreignKey: "userId"
    });
  };

  Paragraph.associate = function(models) {
    models.Paragraph.belongsTo(models.Story, {
      onDelete: "CASCADE",
      foreignKey: "storyId"
    });
  };

  return Paragraph;
};

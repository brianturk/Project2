module.exports = (sequelize, DataTypes) => {
  const Paragraph = sequelize.define("Paragraph", {
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  });

  return Paragraph;
};

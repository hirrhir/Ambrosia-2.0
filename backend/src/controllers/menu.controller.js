const prisma = require('../utils/prismaClient');

const getCategories = async (req, res) => {
  const categories = await prisma.menuCategory.findMany({
    include: { items: true },
    orderBy: { sortOrder: 'asc' },
  });
  res.json(categories);
};

const createCategory = async (req, res) => {
  const { name, sortOrder } = req.body;
  const category = await prisma.menuCategory.create({
    data: { name, sortOrder: sortOrder || 0 },
  });
  res.status(201).json(category);
};

const getMenuItems = async (req, res) => {
  const items = await prisma.menuItem.findMany({ include: { category: true } });
  res.json(items);
};

const createMenuItem = async (req, res) => {
  const { categoryId, name, description, price, isAvailable } = req.body;
  const item = await prisma.menuItem.create({
    data: { categoryId, name, description, price, isAvailable: isAvailable ?? true },
  });
  res.status(201).json(item);
};

const updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const item = await prisma.menuItem.update({
    where: { id: Number(id) },
    data: req.body,
  });
  res.json(item);
};

const deleteMenuItem = async (req, res) => {
  const { id } = req.params;
  await prisma.menuItem.delete({ where: { id: Number(id) } });
  res.status(204).send();
};

module.exports = {
  getCategories, createCategory,
  getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem,
};
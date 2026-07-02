const prisma = require('../utils/prismaClient');

// Create an order (customer -> delivery, waiter -> dine-in)
const createOrder = async (req, res) => {
  try {
    const { orderType, tableId, deliveryAddress, items } = req.body;
    // items: [{ menuItemId, quantity, specialInstructions }]

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must have at least one item' });
    }

    // fetch menu items to get current prices
    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
    });

    const orderItemsData = items.map((i) => {
      const menuItem = menuItems.find((m) => m.id === i.menuItemId);
      return {
        menuItemId: i.menuItemId,
        quantity: i.quantity,
        unitPrice: menuItem.price,
        specialInstructions: i.specialInstructions || null,
      };
    });

    const totalPrice = orderItemsData.reduce(
      (sum, i) => sum + i.unitPrice * i.quantity, 0
    );

    const data = {
      orderType,
      status: 'pending',
      totalPrice,
      items: { create: orderItemsData },
    };

    if (orderType === 'delivery') {
      data.customerId = req.user.id;
      data.deliveryAddress = deliveryAddress;
    } else if (orderType === 'dine_in') {
      data.waiterId = req.user.id;
      data.tableId = tableId;
    } else {
      return res.status(400).json({ error: 'Invalid orderType' });
    }

    const order = await prisma.order.create({
      data,
      include: { items: { include: { menuItem: true } } },
    });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Get orders - scoped by role
const getOrders = async (req, res) => {
  const { role, id } = req.user;
  let where = {};

  if (role === 'customer') where = { customerId: id };
  else if (role === 'waiter') where = { waiterId: id };
  // kitchen and admin see all orders (no filter)

  const orders = await prisma.order.findMany({
    where,
    include: { items: { include: { menuItem: true } }, table: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json(orders);
};

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const order = await prisma.order.update({
    where: { id: Number(id) },
    data: { status },
  });

  res.json(order);
};

module.exports = { createOrder, getOrders, updateOrderStatus };
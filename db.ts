import { CoreMessage } from 'ai'
import { randomUUID } from 'crypto'

const USERS = [
  {
    id: 1,
    name: 'Ekansh',
    email: 'ekansh@thedevelopercompany.com'
  },
  {
    id: 2,
    name: 'John Doe',
    email: 'john@doe.com'
  }
]

const ITEMS = [
  {
    id: 1,
    sku: 'BANANA-1KG',
    name: 'Banana 1kg',
    description:
      'The banana is a widely cultivated and popular fruit that belongs to the genus Musa. It is known for its elongated shape, smooth skin, and soft, sweet flesh',
    price: 1
  },
  {
    id: 2,
    sku: 'APPLE-1KG',
    name: 'Apple 1kg',
    description:
      'The apple is a sweet, edible fruit produced by an apple tree. Apple trees are cultivated worldwide and are the most widely grown species in the genus Malus.',
    price: 2
  },
  {
    id: 3,
    sku: 'MANGO-1KG',
    name: 'Mango 1kg',
    description:
      'The mango is a juicy stone fruit produced from numerous species of tropical trees belonging to the flowering plant genus Mangifera, cultivated mostly for their edible fruit.',
    price: 3
  },
  {
    id: 4,
    sku: 'PINEAPPLE-1KG',
    name: 'Pineapple 1kg',
    description:
      'The pineapple is a tropical plant with an edible fruit and the most economically significant plant in the family Bromeliaceae.',
    price: 4
  },
  {
    id: 5,
    sku: 'ORANGE-1KG',
    name: 'Orange 1kg',
    description:
      'The orange is the fruit of various citrus species in the family Rutaceae; it primarily refers to Citrus sinensis, which is also called sweet orange, to distinguish it from the related Citrus aurantium, referred to as bitter orange.',
    price: 5
  }
]

const CART: {
  id: string
  userId: number
  itemId: number
  quantity: number
}[] = [
  {
    id: '2325252',
    userId: 1,
    itemId: 2,
    quantity: 5
  }
]

const SAVED_CHATS: {
  id: string
  userId: number
  messages: CoreMessage[]
}[] = []

const ORDERS: {
  id: string
  userId: number
  date: Date
  total: number
  items: {
    itemId: number
    quantity: number
    price: number
  }[]
}[] = [
  {
    id: '1',
    userId: 1,
    date: new Date('2024-12-17'),
    total: 10,
    items: [
      {
        itemId: 1,
        quantity: 10,
        price: 1
      }
    ]
  }
]

export const getUserById = (userId: number) => {
  return USERS.find(user => user.id === userId)
}

export const createChat = (userId: number) => {
  const user = getUserById(userId)

  if (!user) {
    throw new Error('User not found')
  }

  const chatId = randomUUID()

  const chat = {
    id: chatId,
    userId,
    messages: [
      {
        role: 'system',
        content: `Your name is FruitBot. You are a helpful ecommerce assistant of "Fruitify.com". You are there to help customers do things like find products, answer questions about products, add item to cart, help them make purchases, ask about their order history. Current chatId is "${chatId}", userId is "${userId}", and name is "${user.name}".`
      },
      {
        role: 'assistant',
        content:
          'Welcome to Fruitify.com! My name is FruitBot. How can I help you today?'
      }
    ] as CoreMessage[]
  }

  SAVED_CHATS.push(chat)

  return chat
}

export const listItems = (page: number, limit: number) => {
  return ITEMS.slice((page - 1) * limit, page * limit)
}

export const searchItems = (search: string, page: number, limit: number) => {
  return ITEMS.filter(
    item =>
      item.id === Number(search) ||
      item.sku.toLowerCase() === search.toLowerCase() ||
      item.name.toLowerCase().includes(search.toLowerCase())
  ).slice((page - 1) * limit, page * limit)
}

export const getItemById = (itemId: number) => {
  return ITEMS.find(item => item.id === itemId)
}

export const getCart = (userId: number) => {
  const items = CART.filter(cart => cart.userId === userId)
  return {
    items: items.map(i => ({
      ...i,
      itemDetails: ITEMS.find(item => item.id === i.itemId)
    })),
    total: items.reduce((acc, cart) => {
      const item = ITEMS.find(item => item.id === cart.itemId)
      return acc + item!.price * cart.quantity
    }, 0)
  }
}

export const addToCart = (userId: number, itemId: number, quantity: number) => {
  const item = ITEMS.find(item => item.id === itemId)
  if (!item) {
    throw new Error('Item not found')
  }

  const alreadyInCart = CART.find(
    cart => cart.userId === userId && cart.itemId === itemId
  )
  if (alreadyInCart) {
    alreadyInCart.quantity += quantity
  } else CART.push({ id: randomUUID(), userId, itemId, quantity })
}

export const removeFromCart = (userId: number, itemId: number) => {
  const index = CART.findIndex(
    cart => cart.userId === userId && cart.itemId === itemId
  )
  if (index !== -1) {
    CART.splice(index, 1)
  }
}

export const emptyCart = (userId: number) => {
  let index = CART.findIndex(cart => cart.userId === userId)
  while (index !== -1) {
    CART.splice(index, 1)
    index = CART.findIndex(cart => cart.userId === userId)
  }
}

export const createOrder = (userId: number) => {
  const cart = getCart(userId)
  const order = {
    id: randomUUID(),
    userId,
    total: cart.total,
    items: cart.items.map(cart => ({
      itemId: cart.itemId,
      quantity: cart.quantity,
      price: ITEMS.find(item => item.id === cart.itemId)!.price
    })),
    date: new Date()
  }
  ORDERS.push(order)
  emptyCart(userId)
  return order
}

export const getOrders = (
  userId: number,
  page: number,
  limit: number,
  dateRange?: {
    start: Date
    end: Date
  }
) => {
  const orders = ORDERS.filter(order =>
    order.userId === userId && dateRange
      ? order.date > dateRange.start && order.date < dateRange.end
      : true
  ).slice((page - 1) * limit, page * limit)

  return orders.map(o => ({
    ...o,
    items: o.items.map(item => ({
      ...item,
      itemDetails: ITEMS.find(i => i.id === item.itemId)
    }))
  }))
}

import { CoreMessage } from 'ai'
import { randomUUID } from 'crypto'

const users: {
  id: string
  name: string
  email: string
}[] = [
  {
    id: '67213a4c-2cb6-4549-a87d-87e793bcaa53',
    name: 'Ekansh',
    email: 'ejekanshjain@gmail.com'
  },
  {
    id: '24ec82ae-4a11-4690-ad88-f56e3534b298',
    name: 'John Doe',
    email: 'john@doe.com'
  }
]

const items: {
  id: string
  sku: string
  name: string
  description: string
  price: number
}[] = [
  {
    id: 'cc7a5798-0356-4706-a732-562120cb9555',
    sku: 'BANANA-1KG',
    name: 'Banana 1kg',
    description:
      'The banana is a widely cultivated and popular fruit that belongs to the genus Musa. It is known for its elongated shape, smooth skin, and soft, sweet flesh. Bananas are a rich source of potassium, vitamin B6, vitamin C, and dietary fiber.',
    price: 1
  },
  {
    id: '90d249de-0d93-4eb2-bbd2-3e471bcca3d7',
    sku: 'APPLE-1KG',
    name: 'Apple 1kg',
    description:
      'The apple is a sweet, edible fruit produced by an apple tree. Apple trees are cultivated worldwide and are the most widely grown species in the genus Malus. Apples are a good source of vitamin C, potassium, and dietary fiber.',
    price: 2
  },
  {
    id: '1a7b0f38-26aa-4441-b604-18deb70c9b27',
    sku: 'MANGO-1KG',
    name: 'Mango 1kg',
    description:
      'The mango is a juicy stone fruit produced from numerous species of tropical trees belonging to the flowering plant genus Mangifera, cultivated mostly for their edible fruit. Mangos are rich in vitamin A, vitamin C, vitamin E, and antioxidants.',
    price: 3
  },
  {
    id: '965b9bb6-f0c1-4e07-9080-b32cca3e4662',
    sku: 'PINEAPPLE-1KG',
    name: 'Pineapple 1kg',
    description:
      'The pineapple is a tropical plant with an edible fruit and the most economically significant plant in the family Bromeliaceae. Pineapples are an excellent source of vitamin C, manganese, and bromelain, an enzyme that aids digestion.',
    price: 4
  },
  {
    id: '6729dbd8-369b-48d4-bd42-aff0d15efffd',
    sku: 'ORANGE-1KG',
    name: 'Orange 1kg',
    description:
      'The orange is the fruit of various citrus species in the family Rutaceae; it primarily refers to Citrus sinensis, which is also called sweet orange, to distinguish it from the related Citrus aurantium, referred to as bitter orange. Oranges are packed with vitamin C, potassium, and flavonoids.',
    price: 5
  }
]

const cart: {
  id: string
  userId: string
  itemId: string
  quantity: number
}[] = [
  {
    id: '3d7a654f-fb90-4d23-9027-37207072bb78',
    userId: '67213a4c-2cb6-4549-a87d-87e793bcaa53',
    itemId: '6729dbd8-369b-48d4-bd42-aff0d15efffd',
    quantity: 2
  }
]

const chats: {
  id: string
  userId: string
  messages: CoreMessage[]
}[] = []

const orders: {
  id: string
  userId: string
  date: Date
  total: number
  items: {
    itemId: string
    quantity: number
    price: number
  }[]
}[] = [
  {
    id: '1',
    userId: '67213a4c-2cb6-4549-a87d-87e793bcaa53',
    date: new Date('2024-12-17'),
    total: 10,
    items: [
      {
        itemId: '90d249de-0d93-4eb2-bbd2-3e471bcca3d7',
        quantity: 10,
        price: 1
      }
    ]
  }
]

export const getUserById = (userId: string) => {
  return users.find(user => user.id === userId)
}

export const createChat = (userId: string) => {
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
        content: `Your name is FruitBot. You are a helpful ecommerce assistant of "Fruitify.com". You are there to help customers do things like find products, answer questions about products, add item to cart, help them make purchases, ask about their order history. Current chatId is "${chatId}", userId is "${userId}", and name is "${user.name}". Always reply with a very layman easy, simple language.`
      },
      {
        role: 'assistant',
        content:
          'Welcome to Fruitify.com! My name is FruitBot. How can I help you today?'
      }
    ] as CoreMessage[]
  }

  chats.push(chat)

  return chat
}

export const listItems = (page: number, limit: number) => {
  return items.slice((page - 1) * limit, page * limit)
}

export const searchItems = (search: string, page: number, limit: number) => {
  return items
    .filter(
      item =>
        item.id === search ||
        item.sku.toLowerCase() === search.toLowerCase() ||
        item.name.toLowerCase().includes(search.toLowerCase())
    )
    .slice((page - 1) * limit, page * limit)
}

export const getItemById = (itemId: string) => {
  return items.find(item => item.id === itemId)
}

export const getCart = (userId: string) => {
  const cartItems = cart
    .filter(cart => cart.userId === userId)
    .map(i => ({
      ...i,
      itemDetails: items.find(item => item.id === i.itemId)
    }))
  return {
    items: cartItems,
    total: cartItems.reduce(
      (acc, cart) => acc + cart!.itemDetails!.price * cart.quantity,
      0
    )
  }
}

export const addToCart = (userId: string, itemId: string, quantity: number) => {
  const item = items.find(item => item.id === itemId)
  if (!item) {
    throw new Error('Item not found')
  }

  const alreadyInCart = cart.find(
    cart => cart.userId === userId && cart.itemId === itemId
  )
  if (alreadyInCart) {
    alreadyInCart.quantity += quantity
  } else cart.push({ id: randomUUID(), userId, itemId, quantity })
}

export const removeFromCart = (userId: string, itemId: string) => {
  const index = cart.findIndex(
    cart => cart.userId === userId && cart.itemId === itemId
  )
  if (index !== -1) {
    cart.splice(index, 1)
  }
}

export const emptyCart = (userId: string) => {
  let index = cart.findIndex(cart => cart.userId === userId)
  while (index !== -1) {
    cart.splice(index, 1)
    index = cart.findIndex(cart => cart.userId === userId)
  }
}

export const createOrder = (userId: string) => {
  const cart = getCart(userId)
  const order = {
    id: randomUUID(),
    userId,
    total: cart.total,
    items: cart.items.map(cart => ({
      itemId: cart.itemId,
      quantity: cart.quantity,
      price: items.find(item => item.id === cart.itemId)!.price
    })),
    date: new Date()
  }
  orders.push(order)
  emptyCart(userId)
  return order
}

export const getOrders = (
  userId: string,
  page: number,
  limit: number,
  dateRange?: {
    start: Date
    end: Date
  }
) => {
  const filteredOrders = orders
    .filter(order =>
      order.userId === userId && dateRange
        ? order.date > dateRange.start && order.date < dateRange.end
        : true
    )
    .slice((page - 1) * limit, page * limit)

  return filteredOrders.map(o => ({
    ...o,
    items: o.items.map(item => ({
      ...item,
      itemDetails: items.find(i => i.id === item.itemId)
    }))
  }))
}

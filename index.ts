import { openai } from '@ai-sdk/openai'
import { createTogetherAI } from '@ai-sdk/togetherai'
import { streamText, tool } from 'ai'
import { config } from 'dotenv'
import * as readline from 'node:readline/promises'
import { z } from 'zod'
import {
  addToCart,
  createChat,
  createOrder,
  emptyCart,
  getCart,
  getOrders,
  getUserById,
  listItems,
  removeFromCart,
  searchItems
} from './db'

config()

const togetherai = createTogetherAI({
  apiKey: process.env.TOGETHER_AI_API_KEY ?? ''
})

const models = {
  openai: openai('gpt-4o-mini'),
  together: togetherai('meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo')
}

async function main() {
  const loggedInUser = getUserById('67213a4c-2cb6-4549-a87d-87e793bcaa53')

  if (!loggedInUser) {
    throw new Error('User not found')
  }

  const chat = createChat(loggedInUser.id)

  const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  process.stdout.write(`Assistant: ${chat.messages[1].content}\n\n`)

  while (true) {
    const userInput = await terminal.question('You: ')

    chat.messages.push({ role: 'user', content: userInput })

    const result = streamText({
      model: models.openai,
      messages: chat.messages,
      maxSteps: 10,
      tools: {
        getUserDetails: tool({
          description: 'Get user details',
          parameters: z.object({}),
          execute: async () => {
            return getUserById(loggedInUser.id)
          }
        }),
        listItems: tool({
          description: 'List all items',
          parameters: z.object({}),
          execute: async () => {
            return listItems(1, 10)
          }
        }),
        searchItems: tool({
          description: 'Search for items',
          parameters: z.object({
            search: z.string()
          }),
          execute: async ({ search }) => {
            return searchItems(search, 1, 10)
          }
        }),
        getCart: tool({
          description: 'Get the current cart',
          parameters: z.object({}),
          execute: async () => {
            return getCart(loggedInUser.id)
          }
        }),
        addToCart: tool({
          description: 'Add an item to the cart',
          parameters: z.object({
            itemId: z.string().describe('This is uuid of item, not the sku'),
            quantity: z.number()
          }),
          execute: async ({ itemId, quantity }) => {
            addToCart(loggedInUser.id, itemId, quantity)
            return getCart(loggedInUser.id)
          }
        }),
        removeFromCart: tool({
          description: 'Remove an item from the cart',
          parameters: z.object({
            itemId: z.string().describe('This is uuid of item, not the sku')
          }),
          execute: async ({ itemId }) => {
            removeFromCart(loggedInUser.id, itemId)
            return getCart(loggedInUser.id)
          }
        }),
        emptyCart: tool({
          description: 'Empty the cart',
          parameters: z.object({}),
          execute: async () => {
            emptyCart(loggedInUser.id)
            return getCart(loggedInUser.id)
          }
        }),
        createOrder: tool({
          description: 'Create an order.',
          parameters: z.object({}),
          execute: async () => {
            return createOrder(loggedInUser.id)
          }
        }),
        getOrders: tool({
          description: 'Get order history',
          parameters: z.object({
            dateRange: z
              .object({
                start: z.string(),
                end: z.string()
              })
              .optional()
              .nullable()
              .describe(
                'This is optional parameter, must be valid ISO String date'
              )
          }),
          execute: async ({ dateRange }) => {
            return getOrders(
              loggedInUser.id,
              1,
              10,
              dateRange
                ? {
                    start: new Date(dateRange.start),
                    end: new Date(dateRange.end)
                  }
                : undefined
            )
          }
        })
      }
    })

    let fullResponse = ''
    process.stdout.write('\nAssistant: ')
    for await (const delta of result.textStream) {
      fullResponse += delta
      process.stdout.write(delta)
    }
    process.stdout.write('\n\n')

    chat.messages.push({ role: 'assistant', content: fullResponse })
  }
}

main().catch(console.error)

import prisma from './lib/prisma'

async function test() {
  try {
    console.log('Checking prisma.episode...')
    if (prisma && 'episode' in prisma) {
      console.log('SUCCESS: prisma.episode exists')
    } else {
      console.log('FAILURE: prisma.episode does NOT exist')
      // List all properties on prisma to see what IS there
      console.log('Available properties:', Object.keys(prisma))
    }
  } catch (error) {
    console.error('Error checking prisma:', error)
  }
}

test()

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

export async function GET() {
  try {
    // 1. Basic Stats
    const [userCount, bookCount, testCount, totalSales] = await Promise.all([
      prisma.user.count(),
      prisma.book.count(),
      prisma.test.count(),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      })
    ])

    // 2. Chart Data (Last 6 Months)
    const chartData = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i)
      const start = startOfMonth(monthDate)
      const end = endOfMonth(monthDate)
      
      const count = await prisma.user.count({
        where: {
          createdAt: {
            gte: start,
            lte: end
          }
        }
      })
      
      // Arabic Month Names or simple 1, 2, 3...
      const monthNames = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ]
      
      chartData.push({
        name: monthNames[monthDate.getMonth()],
        users: count
      })
    }

    // 3. Recent Users
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: { attempts: true }
        }
      }
    })

    return NextResponse.json({
      stats: {
        users: userCount,
        books: bookCount,
        tests: testCount,
        sales: totalSales._sum.amount || 0
      },
      chartData,
      recentUsers
    })
  } catch (error) {
    console.error('Dashboard Stats API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 })
  }
}

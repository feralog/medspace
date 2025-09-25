import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/supabase'
import { Topic } from '@/types'

// GET /api/topics - Get all topics for authenticated user
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceSupabase()

    // Get user from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization token' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Fetch topics with reviews
    const { data: topics, error: topicsError } = await supabase
      .from('topics')
      .select(`
        *,
        reviews (
          id,
          review_number,
          date,
          completed
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (topicsError) {
      return NextResponse.json({ error: topicsError.message }, { status: 500 })
    }

    // Transform to match frontend Topic type
    const transformedTopics: Topic[] = (topics as any).map((topic: any) => ({
      id: topic.id,
      topic: topic.title, // Map title to topic field
      subject: topic.subject,
      color: topic.color,
      tags: topic.tags || [],
      source: topic.source || 'aula', // Use stored source or default to aula
      createdAt: new Date(topic.created_at),
      scheduledReviews: topic.scheduled_reviews.map((date: string) => new Date(date)),
      reviews: (topic.reviews || []).map((review: any) => ({
        date: new Date(review.date),
        completed: review.completed,
        reviewNumber: review.review_number
      })),
      completed: topic.completed
    }))

    return NextResponse.json(transformedTopics)
  } catch (error) {
    console.error('Error fetching topics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/topics - Create new topic
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceSupabase()

    // Get user from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization token' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { title, subject, color, description, tags, source } = body

    // Calculate scheduled reviews (spaced repetition intervals)
    const now = new Date()
    const intervals = [1, 3, 7, 14, 30, 60, 120] // days
    const scheduledReviews = intervals.map(days => {
      const date = new Date(now)
      date.setDate(date.getDate() + days)
      return date.toISOString()
    })

    // Insert topic
    const { data: topic, error: topicError } = await (supabase
      .from('topics') as any)
      .insert({
        user_id: user.id,
        title,
        subject,
        color,
        description: description || null,
        tags: tags || [],
        source: source || 'aula',
        scheduled_reviews: scheduledReviews
      })
      .select()
      .single()

    if (topicError) {
      return NextResponse.json({ error: topicError.message }, { status: 500 })
    }

    // Create or update subject
    const { error: subjectError } = await (supabase
      .from('subjects') as any)
      .upsert({
        user_id: user.id,
        subject,
        color
      }, {
        onConflict: 'user_id,subject',
        ignoreDuplicates: false
      })

    if (subjectError) {
      console.warn('Error upserting subject:', subjectError)
    }

    // Transform to match frontend Topic type
    const transformedTopic: Topic = {
      id: (topic as any).id,
      topic: (topic as any).title, // Map title to topic field
      subject: (topic as any).subject,
      color: (topic as any).color,
      tags: (topic as any).tags || [],
      source: (topic as any).source || 'aula',
      createdAt: new Date((topic as any).created_at),
      scheduledReviews: (topic as any).scheduled_reviews.map((date: string) => new Date(date)),
      reviews: [],
      completed: (topic as any).completed
    }

    return NextResponse.json(transformedTopic, { status: 201 })
  } catch (error) {
    console.error('Error creating topic:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/supabase'

// POST /api/reviews - Complete a topic review
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
    const { topicId, reviewNumber } = body

    // Insert review
    const { data: review, error: reviewError } = await (supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('reviews') as any)
      .insert({
        topic_id: topicId as string,
        user_id: user.id,
        review_number: reviewNumber as number,
        date: new Date().toISOString(),
        completed: true
      })
      .select()
      .single()

    if (reviewError) {
      return NextResponse.json({ error: reviewError.message }, { status: 500 })
    }

    // Check if all reviews are completed for this topic
    const { data: topic, error: topicError } = await supabase
      .from('topics')
      .select('scheduled_reviews')
      .eq('id', topicId)
      .single()

    if (topicError) {
      return NextResponse.json({ error: topicError.message }, { status: 500 })
    }

    // Count completed reviews
    const { count: completedCount, error: countError } = await supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('topic_id', topicId)
      .eq('completed', true)

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 })
    }

    // If all reviews completed, mark topic as completed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (completedCount && completedCount >= (topic as any).scheduled_reviews.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase
        .from('topics') as any)
        .update({ completed: true, updated_at: new Date().toISOString() })
        .eq('id', topicId)
        .eq('user_id', user.id)

      if (updateError) {
        console.warn('Error marking topic as completed:', updateError)
      }
    }

    return NextResponse.json({
      id: review.id,
      date: new Date(review.date),
      completed: review.completed,
      reviewNumber: review.review_number
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/supabase'

// PATCH /api/subjects/[subject] - Update subject
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ subject: string }> }
) {
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
    const { newSubject, newColor } = body
    const resolvedParams = await params
    const oldSubject = decodeURIComponent(resolvedParams.subject)

    // Start a transaction by updating subjects first
    const { data: updatedSubject, error: subjectError } = await (supabase
      .from('subjects') as any)
      .update({
        subject: newSubject,
        color: newColor,
        updated_at: new Date().toISOString()
      })
      .eq('subject', oldSubject)
      .eq('user_id', user.id)
      .select()
      .single()

    if (subjectError) {
      return NextResponse.json({ error: subjectError.message }, { status: 500 })
    }

    // Update all topics with the old subject name
    const { error: topicsError } = await (supabase
      .from('topics') as any)
      .update({
        subject: newSubject,
        color: newColor,
        updated_at: new Date().toISOString()
      })
      .eq('subject', oldSubject)
      .eq('user_id', user.id)

    if (topicsError) {
      console.warn('Error updating topics with new subject:', topicsError)
    }

    // Update settings if this was the last used subject
    const { data: settings } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (settings && settings.last_used_subject === oldSubject) {
      const updatedRecentSubjects = (settings.recent_subjects || []).map(
        (s: string) => s === oldSubject ? newSubject : s
      )

      await (supabase
        .from('settings') as any)
        .update({
          last_used_subject: newSubject,
          recent_subjects: updatedRecentSubjects,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
    }

    return NextResponse.json(updatedSubject)
  } catch (error) {
    console.error('Error updating subject:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/subjects/[subject] - Delete subject and all its topics
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ subject: string }> }
) {
  try {
    const supabase = createServiceSupabase()

    // Get user from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ') ) {
      return NextResponse.json({ error: 'No authorization token' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const resolvedParams = await params
    const subjectToDelete = decodeURIComponent(resolvedParams.subject)

    // Delete all topics from this subject (reviews will cascade delete)
    const { error: topicsError } = await supabase
      .from('topics')
      .delete()
      .eq('subject', subjectToDelete)
      .eq('user_id', user.id)

    if (topicsError) {
      return NextResponse.json({ error: topicsError.message }, { status: 500 })
    }

    // Delete the subject
    const { error: subjectError } = await supabase
      .from('subjects')
      .delete()
      .eq('subject', subjectToDelete)
      .eq('user_id', user.id)

    if (subjectError) {
      return NextResponse.json({ error: subjectError.message }, { status: 500 })
    }

    // Clean up settings
    const { data: settings } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (settings) {
      const updatedRecentSubjects = (settings.recent_subjects || []).filter(
        (s: string) => s !== subjectToDelete
      )

      await (supabase
        .from('settings') as any)
        .update({
          last_used_subject: settings.last_used_subject === subjectToDelete ? null : settings.last_used_subject,
          recent_subjects: updatedRecentSubjects,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting subject:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
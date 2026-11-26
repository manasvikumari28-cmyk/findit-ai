import { useState } from 'react'
import { supabase } from './supabase'

export default function LostItem() {
  const [form, setForm] = useState({
    item_name: '',
    description: '',
    location: '',
    lost_date: ''
  })

  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    const { data: { user }, error: authError } =
      await supabase.auth.getUser()

    if (authError || !user) {
      setMessage('Please login first.')
      return
    }

    const { error } = await supabase
      .from('lost_items')
      .insert([{
        ...form,
        user_id: user.id
      }])

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Lost item reported successfully!')
      setForm({
        item_name: '',
        description: '',
        location: '',
        lost_date: ''
      })
    }
  }

  return (
    <div>
      <h2>Report a Lost Item</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Item name"
          value={form.item_name}
          onChange={e => setForm({
            ...form, item_name: e.target.value
          })}
          required
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={e => setForm({
            ...form, description: e.target.value
          })}
        />

        <input
          placeholder="Lost location"
          value={form.location}
          onChange={e => setForm({
            ...form, location: e.target.value
          })}
          required
        />

        <input
          type="date"
          value={form.lost_date}
          onChange={e => setForm({
            ...form, lost_date: e.target.value
          })}
          required
        />

        <button type="submit">
          Submit Lost Item
        </button>
      </form>

      <p>{message}</p>
    </div>
  )
}
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

function CoursesPage() {
  const { userId, isLoggedIn } = useAuth()
  const [courses, setCourses] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      const query = isLoggedIn && userId ? `?userId=${userId}` : ''
      const { data } = await api.get(`/api/learn/courses${query}`)
      setCourses(data)
    }
    load()
  }, [isLoggedIn, userId])

  const filtered = useMemo(
    () => courses.filter((course) => course.title?.toLowerCase().includes(search.toLowerCase())),
    [courses, search],
  )

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-4 shadow">
        <h1 className="text-2xl font-semibold">Published Courses</h1>
        <input
          className="mt-3 w-full rounded-md border px-3 py-2 md:w-96"
          placeholder="Search by course name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((course) => (
          <div key={course.id} className="rounded-xl bg-white p-4 shadow">
            <p className="text-xs text-slate-500">{course.tags || 'General'}</p>
            <h2 className="mt-1 text-lg font-semibold">{course.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{course.shortDescription || 'No description yet.'}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-700">
                {course.accessRule === 'PAYMENT' ? `Paid: ${course.price || 0}` : 'Open'}
              </span>
              <Link className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white" to={`/courses/${course.id}`}>
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CoursesPage

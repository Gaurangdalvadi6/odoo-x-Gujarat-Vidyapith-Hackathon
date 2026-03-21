import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

function badgeFromPoints(points = 0) {
  if (points >= 120) return 'Master'
  if (points >= 100) return 'Expert'
  if (points >= 80) return 'Specialist'
  if (points >= 60) return 'Achiever'
  if (points >= 40) return 'Explorer'
  return 'Newbie'
}

function MyCoursesPage() {
  const { userId, auth } = useAuth()
  const [enrollments, setEnrollments] = useState([])

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get(`/api/learn/my-courses/${userId}`)
      setEnrollments(data)
    }
    load()
  }, [userId])

  const stats = useMemo(
    () => ({
      points: auth?.totalPoints ?? 0,
      badge: auth?.badgeLevel ? String(auth.badgeLevel) : badgeFromPoints(auth?.totalPoints ?? 0),
    }),
    [auth],
  )

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <section className="space-y-3 lg:col-span-2">
        <h1 className="text-2xl font-semibold">My Courses</h1>
        {enrollments.map((item) => (
          <div key={item.id} className="rounded-xl bg-white p-4 shadow">
            <h2 className="text-lg font-semibold">{item.course?.title}</h2>
            <p className="text-sm text-slate-600">Status: {item.status}</p>
            <p className="text-sm text-slate-600">Completion: {item.completionPercentage}%</p>
            <Link className="mt-3 inline-block rounded-md bg-indigo-600 px-3 py-2 text-sm text-white" to={`/player/${item.course?.id}/${item.id}`}>
              Continue
            </Link>
          </div>
        ))}
      </section>
      <aside className="rounded-xl bg-white p-4 shadow">
        <h3 className="text-lg font-semibold">My Profile</h3>
        <p className="mt-2 text-sm text-slate-600">Total Points: {stats.points}</p>
        <p className="text-sm text-slate-600">Badge: {stats.badge}</p>
      </aside>
    </div>
  )
}

export default MyCoursesPage

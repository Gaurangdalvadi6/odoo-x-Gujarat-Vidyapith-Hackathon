import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

function AdminPage() {
  const { userId } = useAuth()
  const [courses, setCourses] = useState([])
  const [activeCourseId, setActiveCourseId] = useState('')
  const [report, setReport] = useState([])
  const [message, setMessage] = useState('')

  const [courseForm, setCourseForm] = useState({ title: '' })
  const [lessonForm, setLessonForm] = useState({ title: '', type: 'VIDEO', lessonOrder: 1 })
  const [quizForm, setQuizForm] = useState({ title: 'Quiz 1' })

  const loadCourses = async () => {
    const { data } = await api.get('/api/admin/courses')
    setCourses(data)
  }

  useEffect(() => {
    loadCourses()
  }, [])

  const createCourse = async (e) => {
    e.preventDefault()
    await api.post('/api/admin/courses', { ...courseForm, responsibleUserId: userId })
    setCourseForm({ title: '' })
    setMessage('Course created')
    loadCourses()
  }

  const togglePublish = async (course) => {
    await api.patch(`/api/admin/courses/${course.id}/publish?value=${!course.published}`)
    loadCourses()
  }

  const addLesson = async (e) => {
    e.preventDefault()
    if (!activeCourseId) return
    await api.post(`/api/admin/courses/${activeCourseId}/lessons`, lessonForm)
    setMessage('Lesson added')
    setLessonForm({ title: '', type: 'VIDEO', lessonOrder: 1 })
  }

  const addQuiz = async (e) => {
    e.preventDefault()
    if (!activeCourseId) return
    await api.post(`/api/admin/courses/${activeCourseId}/quizzes`, quizForm)
    setMessage('Quiz added')
  }

  const loadReport = async () => {
    if (!activeCourseId) return
    const { data } = await api.get(`/api/admin/reports/courses/${activeCourseId}`)
    setReport(data)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Instructor/Admin Backoffice</h1>
      {message && <p className="text-sm text-indigo-700">{message}</p>}

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl bg-white p-4 shadow">
          <h2 className="font-semibold">Create Course</h2>
          <form className="mt-3 space-y-2" onSubmit={createCourse}>
            <input
              className="w-full rounded-md border px-3 py-2"
              placeholder="Course title"
              value={courseForm.title}
              onChange={(e) => setCourseForm({ title: e.target.value })}
            />
            <button className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white" type="submit">
              Add Course
            </button>
          </form>
        </section>

        <section className="rounded-xl bg-white p-4 shadow">
          <h2 className="font-semibold">Add Lesson</h2>
          <select
            className="mt-2 w-full rounded-md border px-3 py-2"
            value={activeCourseId}
            onChange={(e) => setActiveCourseId(e.target.value)}
          >
            <option value="">Select course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
          <form className="mt-3 space-y-2" onSubmit={addLesson}>
            <input
              className="w-full rounded-md border px-3 py-2"
              placeholder="Lesson title"
              value={lessonForm.title}
              onChange={(e) => setLessonForm((prev) => ({ ...prev, title: e.target.value }))}
            />
            <select
              className="w-full rounded-md border px-3 py-2"
              value={lessonForm.type}
              onChange={(e) => setLessonForm((prev) => ({ ...prev, type: e.target.value }))}
            >
              <option value="VIDEO">Video</option>
              <option value="DOCUMENT">Document</option>
              <option value="IMAGE">Image</option>
            </select>
            <button className="rounded-md bg-slate-800 px-3 py-2 text-sm text-white" type="submit">
              Add Lesson
            </button>
          </form>
        </section>

        <section className="rounded-xl bg-white p-4 shadow">
          <h2 className="font-semibold">Add Quiz</h2>
          <form className="mt-3 space-y-2" onSubmit={addQuiz}>
            <input
              className="w-full rounded-md border px-3 py-2"
              placeholder="Quiz title"
              value={quizForm.title}
              onChange={(e) => setQuizForm({ title: e.target.value })}
            />
            <button className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white" type="submit">
              Add Quiz
            </button>
          </form>
        </section>
      </div>

      <section className="rounded-xl bg-white p-4 shadow">
        <h2 className="font-semibold">Courses Dashboard (List)</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {courses.map((course) => (
            <div key={course.id} className="rounded-md border p-3">
              <p className="font-medium">{course.title}</p>
              <p className="text-sm text-slate-600">Published: {String(course.published)}</p>
              <button
                className="mt-2 rounded-md bg-indigo-600 px-3 py-2 text-xs text-white"
                type="button"
                onClick={() => togglePublish(course)}
              >
                Toggle Publish
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-white p-4 shadow">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Reporting Dashboard</h2>
          <button type="button" className="rounded-md bg-slate-800 px-3 py-2 text-xs text-white" onClick={loadReport}>
            Load Report
          </button>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-2">Participant</th>
                <th className="p-2">Status</th>
                <th className="p-2">Completion %</th>
                <th className="p-2">Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {report.map((row) => (
                <tr key={row.id} className="border-b">
                  <td className="p-2">{row.user?.name}</td>
                  <td className="p-2">{row.status}</td>
                  <td className="p-2">{row.completionPercentage}</td>
                  <td className="p-2">{row.enrolledDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default AdminPage

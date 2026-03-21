import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

function AdminPage() {
  const { userId } = useAuth()
  const [courses, setCourses] = useState([])
  const [activeCourseId, setActiveCourseId] = useState('')
  const [report, setReport] = useState([])
  const [message, setMessage] = useState('')
  const [view, setView] = useState('LIST')
  const [courseSearch, setCourseSearch] = useState('')
  const [courseDetails, setCourseDetails] = useState({
    tags: '',
    shortDescription: '',
    description: '',
    website: '',
    visibility: 'EVERYONE',
    accessRule: 'OPEN',
    price: 0,
  })

  const [courseForm, setCourseForm] = useState({ title: '' })
  const [lessonForm, setLessonForm] = useState({ title: '', type: 'VIDEO', lessonOrder: 1 })
  const [quizForm, setQuizForm] = useState({ title: 'Quiz 1' })
  const [questionForm, setQuestionForm] = useState({
    quizId: '',
    text: '',
    questionOrder: 1,
    options: [
      { text: '', correct: true },
      { text: '', correct: false },
    ],
  })

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

  const updateCourse = async (e) => {
    e.preventDefault()
    if (!activeCourseId) return
    const selected = courses.find((item) => String(item.id) === String(activeCourseId))
    if (!selected) return
    await api.put(`/api/admin/courses/${activeCourseId}`, {
      ...selected,
      ...courseDetails,
      price: Number(courseDetails.price || 0),
    })
    setMessage('Course details saved')
    loadCourses()
  }

  const addQuestion = async (e) => {
    e.preventDefault()
    if (!questionForm.quizId) return
    await api.post(`/api/admin/quizzes/${questionForm.quizId}/questions`, {
      text: questionForm.text,
      questionOrder: Number(questionForm.questionOrder),
      options: questionForm.options,
    })
    setQuestionForm({
      quizId: questionForm.quizId,
      text: '',
      questionOrder: Number(questionForm.questionOrder) + 1,
      options: [
        { text: '', correct: true },
        { text: '', correct: false },
      ],
    })
    setMessage('Quiz question added')
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
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold">Courses Dashboard</h2>
          <button type="button" onClick={() => setView('LIST')} className={`rounded px-2 py-1 text-xs ${view === 'LIST' ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>
            List
          </button>
          <button type="button" onClick={() => setView('KANBAN')} className={`rounded px-2 py-1 text-xs ${view === 'KANBAN' ? 'bg-indigo-600 text-white' : 'bg-slate-200'}`}>
            Kanban
          </button>
          <input
            className="ml-auto rounded-md border px-3 py-2 text-sm"
            placeholder="Search course"
            value={courseSearch}
            onChange={(e) => setCourseSearch(e.target.value)}
          />
        </div>
        <div className={`mt-3 grid gap-3 ${view === 'KANBAN' ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
          {courses
            .filter((course) => course.title?.toLowerCase().includes(courseSearch.toLowerCase()))
            .map((course) => (
            <div key={course.id} className="rounded-md border p-3">
              <p className="font-medium">{course.title}</p>
              <p className="text-xs text-slate-500">Tags: {course.tags || '-'}</p>
              <p className="text-xs text-slate-500">Views: {course.viewsCount || 0}</p>
              <p className="text-sm text-slate-600">Published: {String(course.published)}</p>
              <button
                className="mt-2 mr-2 rounded-md border px-3 py-2 text-xs"
                type="button"
                onClick={() => setActiveCourseId(String(course.id))}
              >
                Select
              </button>
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

      <section className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl bg-white p-4 shadow">
          <h2 className="font-semibold">Course Form (Edit)</h2>
          <p className="text-xs text-slate-500">Selected course id: {activeCourseId || '-'}</p>
          <form className="mt-3 grid gap-2 md:grid-cols-2" onSubmit={updateCourse}>
            <input className="rounded-md border px-3 py-2" placeholder="Tags" value={courseDetails.tags} onChange={(e) => setCourseDetails((p) => ({ ...p, tags: e.target.value }))} />
            <input className="rounded-md border px-3 py-2" placeholder="Website" value={courseDetails.website} onChange={(e) => setCourseDetails((p) => ({ ...p, website: e.target.value }))} />
            <input className="rounded-md border px-3 py-2 md:col-span-2" placeholder="Short description" value={courseDetails.shortDescription} onChange={(e) => setCourseDetails((p) => ({ ...p, shortDescription: e.target.value }))} />
            <textarea className="rounded-md border px-3 py-2 md:col-span-2" placeholder="Description" value={courseDetails.description} onChange={(e) => setCourseDetails((p) => ({ ...p, description: e.target.value }))} />
            <select className="rounded-md border px-3 py-2" value={courseDetails.visibility} onChange={(e) => setCourseDetails((p) => ({ ...p, visibility: e.target.value }))}>
              <option value="EVERYONE">Everyone</option>
              <option value="SIGNED_IN">Signed In</option>
            </select>
            <select className="rounded-md border px-3 py-2" value={courseDetails.accessRule} onChange={(e) => setCourseDetails((p) => ({ ...p, accessRule: e.target.value }))}>
              <option value="OPEN">Open</option>
              <option value="INVITATION">On Invitation</option>
              <option value="PAYMENT">On Payment</option>
            </select>
            <input type="number" className="rounded-md border px-3 py-2" placeholder="Price" value={courseDetails.price} onChange={(e) => setCourseDetails((p) => ({ ...p, price: e.target.value }))} />
            <button className="rounded-md bg-slate-800 px-3 py-2 text-sm text-white" type="submit">Save</button>
          </form>
        </section>

        <section className="rounded-xl bg-white p-4 shadow">
          <h2 className="font-semibold">Quiz Builder (Add Questions)</h2>
          <form className="mt-3 space-y-2" onSubmit={addQuestion}>
            <input className="w-full rounded-md border px-3 py-2" placeholder="Quiz ID" value={questionForm.quizId} onChange={(e) => setQuestionForm((p) => ({ ...p, quizId: e.target.value }))} />
            <input className="w-full rounded-md border px-3 py-2" placeholder="Question text" value={questionForm.text} onChange={(e) => setQuestionForm((p) => ({ ...p, text: e.target.value }))} />
            {questionForm.options.map((opt, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  className="flex-1 rounded-md border px-3 py-2"
                  placeholder={`Option ${idx + 1}`}
                  value={opt.text}
                  onChange={(e) => {
                    const copy = [...questionForm.options]
                    copy[idx] = { ...copy[idx], text: e.target.value }
                    setQuestionForm((p) => ({ ...p, options: copy }))
                  }}
                />
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={opt.correct}
                    onChange={(e) => {
                      const copy = [...questionForm.options]
                      copy[idx] = { ...copy[idx], correct: e.target.checked }
                      setQuestionForm((p) => ({ ...p, options: copy }))
                    }}
                  />
                  Correct
                </label>
              </div>
            ))}
            <button type="button" className="rounded-md border px-3 py-2 text-sm" onClick={() => setQuestionForm((p) => ({ ...p, options: [...p.options, { text: '', correct: false }] }))}>
              Add Option
            </button>
            <button className="ml-2 rounded-md bg-emerald-600 px-3 py-2 text-sm text-white" type="submit">
              Save Question
            </button>
          </form>
        </section>
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

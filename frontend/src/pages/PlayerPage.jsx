import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

function PlayerPage() {
  const { courseId, enrollmentId } = useParams()
  const { userId, updateProfile } = useAuth()
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [lessons, setLessons] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [selected, setSelected] = useState({ type: 'lesson', index: 0 })
  const [quizQuestions, setQuizQuestions] = useState([])
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizIndex, setQuizIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [pointsMessage, setPointsMessage] = useState('')
  const [enrollment, setEnrollment] = useState(null)
  const [courseCompletedMessage, setCourseCompletedMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      const [{ data: lessonData }, { data: quizData }, { data: myCourses }] = await Promise.all([
        api.get(`/api/learn/courses/${courseId}/lessons`),
        api.get(`/api/learn/courses/${courseId}/quizzes`),
        api.get(`/api/learn/my-courses/${userId}`),
      ])
      setLessons(lessonData)
      setQuizzes(quizData)
      setEnrollment(myCourses.find((item) => String(item.id) === String(enrollmentId)) ?? null)
    }
    load()
  }, [courseId, enrollmentId, userId])

  const currentLesson = selected.type === 'lesson' ? lessons[selected.index] : null
  const currentQuiz = selected.type === 'quiz' ? quizzes[selected.index] : null
  const completion = useMemo(() => enrollment?.completionPercentage ?? 0, [enrollment])

  const markLessonComplete = async () => {
    if (!currentLesson) return
    const { data } = await api.post(`/api/learn/enrollments/${enrollmentId}/lessons/${currentLesson.id}/complete`)
    setEnrollment(data)
  }

  const nextContent = async () => {
    if (selected.type === 'lesson') {
      await markLessonComplete()
      if (selected.index < lessons.length - 1) {
        setSelected((prev) => ({ ...prev, index: prev.index + 1 }))
      } else if (quizzes.length) {
        setSelected({ type: 'quiz', index: 0 })
      }
    }
  }

  const startQuiz = async () => {
    if (!currentQuiz) return
    const { data } = await api.get(`/api/learn/quizzes/${currentQuiz.id}/questions`)
    setQuizQuestions(data)
    setQuizStarted(true)
    setQuizIndex(0)
    setAnswers({})
    setPointsMessage('')
  }

  const selectOption = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
  }

  const proceedQuiz = async () => {
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex((prev) => prev + 1)
      return
    }
    const { data } = await api.post(`/api/learn/quizzes/${currentQuiz.id}/submit?userId=${userId}`, { answers })
    setPointsMessage(
      `You have earned ${data.pointsEarned} points. Score: ${data.correctAnswers}/${data.totalQuestions}. Total points: ${data.totalPoints}. Badge: ${data.badgeLevel}`,
    )
    updateProfile({ totalPoints: data.totalPoints, badgeLevel: data.badgeLevel })
    setQuizStarted(false)
    const { data: myCourses } = await api.get(`/api/learn/my-courses/${userId}`)
    setEnrollment(myCourses.find((item) => String(item.id) === String(enrollmentId)) ?? null)
  }

  const completeCourse = async () => {
    const { data } = await api.post(`/api/learn/enrollments/${enrollmentId}/complete-course`)
    setEnrollment(data)
    setCourseCompletedMessage('Course marked as completed successfully.')
  }

  return (
    <div className="flex h-[calc(100vh-96px)] overflow-hidden rounded-xl bg-white shadow">
      {sidebarOpen && (
        <aside className="w-72 overflow-y-auto border-r bg-slate-50 p-3">
          <h2 className="text-lg font-semibold">Course Player</h2>
          <p className="text-sm text-slate-600">{completion}% completed</p>
          <div className="mt-3 space-y-2">
            {lessons.map((lesson, idx) => (
              <button
                key={lesson.id}
                type="button"
                onClick={() => setSelected({ type: 'lesson', index: idx })}
                className={`w-full rounded-md px-3 py-2 text-left text-sm ${selected.type === 'lesson' && selected.index === idx ? 'bg-indigo-600 text-white' : 'bg-white'}`}
              >
                {lesson.title}
              </button>
            ))}
            {quizzes.map((quiz, idx) => (
              <button
                key={quiz.id}
                type="button"
                onClick={() => setSelected({ type: 'quiz', index: idx })}
                className={`w-full rounded-md px-3 py-2 text-left text-sm ${selected.type === 'quiz' && selected.index === idx ? 'bg-emerald-600 text-white' : 'bg-white'}`}
              >
                Quiz: {quiz.title}
              </button>
            ))}
          </div>
        </aside>
      )}

      <section className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <button type="button" className="rounded-md bg-slate-200 px-3 py-2 text-sm" onClick={() => setSidebarOpen((v) => !v)}>
            {sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
          </button>
          <button type="button" className="rounded-md bg-slate-800 px-3 py-2 text-sm text-white" onClick={() => navigate('/my-courses')}>
            Back
          </button>
        </div>

        {selected.type === 'lesson' && currentLesson && (
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold">{currentLesson.title}</h1>
            <p className="text-sm text-slate-600">{currentLesson.description || 'No lesson description.'}</p>
            <div className="rounded-md border p-4">
              <p className="text-sm">Type: {currentLesson.type}</p>
              <p className="text-sm">Content URL: {currentLesson.contentUrl || 'N/A'}</p>
            </div>
            <button type="button" className="rounded-md bg-indigo-600 px-4 py-2 text-white" onClick={nextContent}>
              Next Content
            </button>
          </div>
        )}

        {selected.type === 'quiz' && currentQuiz && (
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold">{currentQuiz.title}</h1>
            {!quizStarted ? (
              <div className="rounded-md border p-4">
                <p className="text-sm">Multiple attempts are allowed.</p>
                <button type="button" className="mt-3 rounded-md bg-emerald-600 px-4 py-2 text-white" onClick={startQuiz}>
                  Start Quiz
                </button>
              </div>
            ) : (
              quizQuestions.length > 0 && (
                <div className="space-y-2 rounded-md border p-4">
                  <p className="text-sm text-slate-500">
                    Question {quizIndex + 1} / {quizQuestions.length}
                  </p>
                  <h3 className="font-semibold">{quizQuestions[quizIndex].text}</h3>
                  {quizQuestions[quizIndex].options.map((option) => (
                    <label key={option.id} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                      <input
                        type="radio"
                        name={`q-${quizQuestions[quizIndex].id}`}
                        checked={String(answers[quizQuestions[quizIndex].id] || '') === String(option.id)}
                        onChange={() => selectOption(quizQuestions[quizIndex].id, option.id)}
                      />
                      {option.text}
                    </label>
                  ))}
                  <button type="button" className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white" onClick={proceedQuiz}>
                    {quizIndex === quizQuestions.length - 1 ? 'Proceed and Complete Quiz' : 'Proceed'}
                  </button>
                </div>
              )
            )}
            {pointsMessage && <p className="rounded-md bg-indigo-50 p-3 text-sm text-indigo-700">{pointsMessage}</p>}
          </div>
        )}

        {completion >= 100 && enrollment?.status !== 'COMPLETED' && (
          <div className="mt-6 rounded-md border border-indigo-200 bg-indigo-50 p-4">
            <p className="text-sm text-indigo-700">All lessons completed. You can now finish the course.</p>
            <button
              type="button"
              className="mt-2 rounded-md bg-indigo-600 px-4 py-2 text-sm text-white"
              onClick={completeCourse}
            >
              Complete this course
            </button>
          </div>
        )}
        {enrollment?.status === 'COMPLETED' && (
          <p className="mt-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">Course completed.</p>
        )}
        {courseCompletedMessage && <p className="mt-2 text-sm text-indigo-700">{courseCompletedMessage}</p>}
      </section>
    </div>
  )
}

export default PlayerPage

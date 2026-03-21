import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

function CourseDetailPage() {
  const { courseId } = useParams()
  const { userId } = useAuth()
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [reviews, setReviews] = useState([])
  const [enrollment, setEnrollment] = useState(null)
  const [reviewForm, setReviewForm] = useState({ rating: 5, reviewText: '' })
  const [quizForm, setQuizForm] = useState({ quizId: '', answers: '{}' })
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      const [{ data: courses }, { data: lessonData }, { data: quizData }, { data: reviewData }, { data: myCourses }] =
        await Promise.all([
          api.get(`/api/learn/courses?userId=${userId}`),
          api.get(`/api/learn/courses/${courseId}/lessons`),
          api.get(`/api/learn/courses/${courseId}/quizzes`),
          api.get(`/api/learn/courses/${courseId}/reviews`),
          api.get(`/api/learn/my-courses/${userId}`),
        ])
      setCourse(courses.find((c) => String(c.id) === String(courseId)) ?? null)
      setLessons(lessonData)
      setQuizzes(quizData)
      setReviews(reviewData)
      setEnrollment(myCourses.find((item) => String(item.course?.id) === String(courseId)) ?? null)
    }
    load()
  }, [courseId, userId])

  const completion = enrollment?.completionPercentage ?? 0

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0
    return (reviews.reduce((sum, item) => sum + (item.rating || 0), 0) / reviews.length).toFixed(1)
  }, [reviews])

  const enroll = async () => {
    const { data } = await api.post(`/api/learn/courses/${courseId}/enroll?userId=${userId}`)
    setEnrollment(data)
  }

  const completeLesson = async (lessonId) => {
    if (!enrollment) return
    const { data } = await api.post(`/api/learn/enrollments/${enrollment.id}/lessons/${lessonId}/complete`)
    setEnrollment(data)
  }

  const submitQuiz = async (e) => {
    e.preventDefault()
    try {
      const parsed = JSON.parse(quizForm.answers)
      const { data } = await api.post(`/api/learn/quizzes/${quizForm.quizId}/submit?userId=${userId}`, {
        answers: parsed,
      })
      setMessage(`Quiz submitted. Points earned: ${data.pointsEarned}`)
    } catch {
      setMessage('Use valid JSON for answers, e.g. {"1":2}')
    }
  }

  const addReview = async (e) => {
    e.preventDefault()
    await api.post(`/api/learn/courses/${courseId}/reviews?userId=${userId}`, reviewForm)
    const { data } = await api.get(`/api/learn/courses/${courseId}/reviews`)
    setReviews(data)
    setReviewForm({ rating: 5, reviewText: '' })
  }

  if (!course) return <p>Loading course...</p>

  return (
    <div className="space-y-4">
      <section className="rounded-xl bg-white p-4 shadow">
        <h1 className="text-2xl font-semibold">{course.title}</h1>
        <p className="mt-2 text-sm text-slate-600">{course.description || 'No description available.'}</p>
        <p className="mt-2 text-sm">Progress: {completion}%</p>
        {!enrollment && (
          <button type="button" className="mt-3 rounded-md bg-indigo-600 px-4 py-2 text-sm text-white" onClick={enroll}>
            Join Course
          </button>
        )}
      </section>

      <section className="rounded-xl bg-white p-4 shadow">
        <h2 className="text-lg font-semibold">Lessons</h2>
        <div className="mt-3 space-y-2">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="font-medium">{lesson.title}</p>
                <p className="text-sm text-slate-500">{lesson.type}</p>
              </div>
              {enrollment && (
                <button
                  className="rounded-md bg-slate-800 px-3 py-2 text-xs text-white"
                  type="button"
                  onClick={() => completeLesson(lesson.id)}
                >
                  Mark Complete
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow">
          <h2 className="text-lg font-semibold">Quizzes</h2>
          {quizzes.map((quiz) => (
            <p key={quiz.id} className="mt-2 text-sm">
              {quiz.title} (id: {quiz.id})
            </p>
          ))}
          <form onSubmit={submitQuiz} className="mt-3 space-y-2">
            <input
              className="w-full rounded-md border px-3 py-2"
              placeholder="Quiz ID"
              value={quizForm.quizId}
              onChange={(e) => setQuizForm((prev) => ({ ...prev, quizId: e.target.value }))}
            />
            <textarea
              className="h-24 w-full rounded-md border px-3 py-2"
              placeholder='Answers JSON, example: {"1":2}'
              value={quizForm.answers}
              onChange={(e) => setQuizForm((prev) => ({ ...prev, answers: e.target.value }))}
            />
            <button className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white" type="submit">
              Submit Quiz
            </button>
          </form>
          {message && <p className="mt-2 text-sm text-indigo-700">{message}</p>}
        </div>

        <div className="rounded-xl bg-white p-4 shadow">
          <h2 className="text-lg font-semibold">Ratings & Reviews</h2>
          <p className="mt-1 text-sm text-slate-600">Average Rating: {averageRating}</p>
          <form className="mt-3 space-y-2" onSubmit={addReview}>
            <input
              type="number"
              min="1"
              max="5"
              className="w-full rounded-md border px-3 py-2"
              value={reviewForm.rating}
              onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
            />
            <textarea
              className="h-20 w-full rounded-md border px-3 py-2"
              placeholder="Write your review"
              value={reviewForm.reviewText}
              onChange={(e) => setReviewForm((prev) => ({ ...prev, reviewText: e.target.value }))}
            />
            <button className="rounded-md bg-slate-800 px-3 py-2 text-sm text-white" type="submit">
              Add Review
            </button>
          </form>
          <div className="mt-3 space-y-2">
            {reviews.map((item) => (
              <div key={item.id} className="rounded-md border p-2 text-sm">
                <p className="font-medium">{item.user?.name || 'Learner'} - {item.rating}/5</p>
                <p>{item.reviewText}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default CourseDetailPage
